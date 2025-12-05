from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, APIRouter, Form, HTTPException
from dotenv import load_dotenv
import google.generativeai as genai
from fastapi.responses import JSONResponse
import os
import re

load_dotenv()

app = FastAPI(title="Chat AI Backend")

from typing import Dict, List, Optional
from pydantic import BaseModel
import json

# Session storage for multi-step diagnosis
diagnosis_sessions: Dict[str, dict] = {}

class QuestionResponse(BaseModel):
    session_id: str
    answer: str

# ✅ CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(tags=["Chat AI"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("❌ CRITICAL: GEMINI_API_KEY not set in chat_ai.py")
    gemini_model = None
else:
    print("✅ GEMINI_API_KEY loaded successfully (chat_ai)")
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-2.5-flash")

# ============================================
# ROOT ENDPOINT (FIX 404 ERROR)
# ============================================
@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "SheCares AI Backend",
        "version": "2.0",
        "message": "🚀 SheCares API is running!",
        "endpoints": {
            "mental_health": "/chat/text",
            "disease_predictor": {
                "quick_predict": "/disease/predict-quick",
                "answer_question": "/disease/answer-question", 
                "detailed_analysis": "/disease/analyze-detailed",
                "follow_up_chat": "/disease/chat"
            }
        },
        "documentation": "/docs",
        "health_check": "/health"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "gemini_configured": gemini_model is not None
    }

# ============================================
# MENTAL WELLNESS ENDPOINT
# ============================================
@router.post("/chat/text")
async def chat_text(message: str = Form(...)):
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini AI not configured.")
    try:
        prompt = (
            f"You are an empathetic AI assistant for women's health mainly as a mental health therapist. "
            f"User asks: '{message}' and you respond helpfully. Keep responses concise and friendly."
        )
        response = gemini_model.generate_content(prompt)
        reply_text = getattr(response, "text", "Sorry, I couldn't process that right now.")
        return {"reply": reply_text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ============================================
# DISEASE PREDICTOR ENDPOINTS
# ============================================

@router.post("/disease/predict-quick")
async def predict_disease_quick(symptoms: str = Form(...)):
    """Initial symptom intake - provides quick predictions AND starts question flow"""
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini AI not configured.")
    
    try:
        import uuid
        session_id = str(uuid.uuid4())
        
        # Generate quick predictions
        quick_prompt = f"""You are a medical ML classifier for women's health.

INPUT SYMPTOMS: {symptoms}

Return EXACTLY 3 possible conditions with COMMON NAMES in this EXACT format:

CONDITION_1|CONFIDENCE_XX.X%|BRIEF_DESCRIPTION
CONDITION_2|CONFIDENCE_XX.X%|BRIEF_DESCRIPTION  
CONDITION_3|CONFIDENCE_XX.X%|BRIEF_DESCRIPTION

Example:
Ovarian Cysts (Hormonal)|78.5%|Hormonal disorder affecting ovulation
Low Thyroid Function|65.2%|Affects metabolism and menstrual cycles
Uterine Tissue Growth|58.9%|Tissue growth causing pelvic pain

Make realistic predictions with varying confidence levels."""

        quick_response = gemini_model.generate_content(quick_prompt)
        quick_text = getattr(quick_response, "text", "")
        
        # Parse quick results
        lines = [line.strip() for line in quick_text.strip().split('\n') if line.strip()]
        quick_conditions = []
        
        for line in lines[:3]:
            parts = line.split('|')
            if len(parts) >= 3:
                quick_conditions.append({
                    "name": parts[0].strip(),
                    "confidence": parts[1].strip(),
                    "description": parts[2].strip()
                })
        
        # Generate diagnostic questions
        questions_prompt = f"""You are a medical diagnostic AI. A user reports these symptoms: {symptoms}

Based on these initial symptoms, generate EXACTLY 10 targeted yes/no questions to narrow down the diagnosis. Focus on women's health conditions.

Format EACH question on a new line starting with "Q:" 

Example:
Q: Have you experienced irregular menstrual cycles in the past 3 months?
Q: Do you have pain in your lower abdomen or pelvic region?
Q: Have you noticed unusual fatigue or weakness?

Generate 10 specific, clear questions."""

        questions_response = gemini_model.generate_content(questions_prompt)
        questions_text = getattr(questions_response, "text", "")
        
        # Parse questions
        questions = []
        for line in questions_text.split('\n'):
            if line.strip().startswith('Q:'):
                questions.append(line.strip()[2:].strip())
        
        questions = questions[:10] if len(questions) >= 10 else questions
        
        # Store session
        diagnosis_sessions[session_id] = {
            "initial_symptoms": symptoms,
            "questions": questions,
            "answers": [],
            "current_question": 0
        }
        
        return {
            "session_id": session_id,
            "initial_symptoms": symptoms,
            "quick_conditions": quick_conditions,
            "total_questions": len(questions),
            "current_question": 1,
            "question": questions[0] if questions else "Do you experience pain?",
            "status": "in_progress"
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/disease/answer-question")
async def answer_question(
    session_id: str = Form(...),
    answer: str = Form(...)
):
    """Process user's answer and return next question or final diagnosis"""
    if session_id not in diagnosis_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = diagnosis_sessions[session_id]
    
    session["answers"].append({
        "question": session["questions"][session["current_question"]],
        "answer": answer
    })
    
    session["current_question"] += 1
    
    if session["current_question"] < len(session["questions"]):
        return {
            "session_id": session_id,
            "current_question": session["current_question"] + 1,
            "total_questions": len(session["questions"]),
            "question": session["questions"][session["current_question"]],
            "status": "in_progress"
        }
    else:
        return {
            "session_id": session_id,
            "status": "completed",
            "message": "All questions answered. Generating diagnosis..."
        }

@router.post("/disease/analyze-detailed")
async def analyze_detailed(session_id: str = Form(...)):
    """Generate final diagnosis after all questions are answered"""
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini AI not configured.")
    
    if session_id not in diagnosis_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = diagnosis_sessions[session_id]
    
    try:
        qa_context = "\n".join([
            f"Q: {qa['question']}\nA: {qa['answer']}"
            for qa in session["answers"]
        ])
        
        prompt = f"""You are an advanced medical ML model specialized in disease prediction for women's health.

INITIAL SYMPTOMS: {session['initial_symptoms']}

DETAILED DIAGNOSTIC QUESTIONS & ANSWERS:
{qa_context}

Provide a precise diagnosis with structured output including:
- Top 3 conditions with confidence scores
- Risk levels
- Recommendations
- Severity assessment

Use specific medical terminology."""

        response = gemini_model.generate_content(prompt)
        prediction_text = getattr(response, "text", "Unable to generate prediction.")
        
        del diagnosis_sessions[session_id]
        
        return {
            "detailed_analysis": prediction_text,
            "symptoms_analyzed": session['initial_symptoms'],
            "questions_answered": len(session['answers']),
            "model_type": "ML_CLASSIFIER_V2_INTERACTIVE"
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/disease/chat")
async def disease_chat(message: str = Form(...), context: str = Form("")):
    """Follow-up chat about the disease prediction"""
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini AI not configured.")
    
    try:
        ml_keywords = ['predict', 'prediction', 'ml model', 'machine learning', 'analyze', 'diagnosis']
        is_ml_request = any(keyword in message.lower() for keyword in ml_keywords)
        
        if is_ml_request:
            prompt = f"""You are a medical ML prediction system. User asks: "{message}"
Previous context: {context}

Provide ML-style structured prediction with confidence scores and recommendations."""
        else:
            prompt = f"""You are a helpful medical AI assistant.
Previous context: {context}
User's question: "{message}"

Provide a helpful, empathetic response."""

        response = gemini_model.generate_content(prompt)
        reply_text = getattr(response, "text", "Sorry, I couldn't process that right now.")
        
        return {
            "reply": reply_text,
            "response_type": "ml_structured" if is_ml_request else "conversational"
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8003))
    uvicorn.run(app, host="0.0.0.0", port=port)