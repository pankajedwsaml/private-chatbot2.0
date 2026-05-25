from flask import Flask, render_template, request, jsonify
from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():

    data = request.json

    user_message = data.get("message")

    history = data.get("history", [])

    messages = [

        {
            "role": "system",
            "content": """
You are a smart modern AI assistant.

Rules:
- Talk naturally
- Remember previous conversation
- Give clear and useful answers
- Avoid robotic replies
- Be friendly and intelligent
- Explain coding simply
- Keep answers clean and structured
- Stay on the current topic
"""
        }

    ]

    for msg in history:

        role = msg["role"]

        if role == "bot":
            role = "assistant"

        messages.append({

            "role": role,

            "content": msg["text"]

        })

    messages.append({

        "role": "user",

        "content": user_message

    })

    try:

        response = client.chat.completions.create(

            model="llama-3.1-8b-instant",

            messages=messages

        )

        bot_reply = response.choices[0].message.content

    except Exception as e:

        print(e)

        bot_reply = "Server is busy right now. Try again."

    return jsonify({

        "reply": bot_reply

    })


if __name__ == "__main__":
    app.run(debug=True)