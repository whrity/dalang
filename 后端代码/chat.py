from flask import jsonify, request
from werkzeug.utils import secure_filename
from datetime import datetime
from flask import Flask
import uuid
import sys
import cv2
import json

import base64
from PIL import Image
import requests


app = Flask(__name__)

import time
import jwt
import requests

# 实际KEY，过期时间
def generate_token(apikey: str, exp_seconds: int):
    try:
        id, secret = apikey.split(".")
    except Exception as e:
        raise Exception("invalid apikey", e)

    payload = {
        "api_key": id,
        "exp": int(round(time.time() * 1000)) + exp_seconds * 1000,
        "timestamp": int(round(time.time() * 1000)),
    }
    return jwt.encode(
        payload,
        secret,
        algorithm="HS256",
        headers={"alg": "HS256", "sign_type": "SIGN"},
    )

def ask_glm(content):
    url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
    headers = {
      'Content-Type': 'application/json',
      'Authorization': generate_token("2024eb0d474b66eb68053ee22932ab5e.CB4TpT2zQw4UVGwK", 1000)
    }

    data = {
        "model": "glm-3-turbo",
        "messages": [{"role": "user", "content": content}]
    }

    response = requests.post(url, headers=headers, json=data)
    chat_response = response.json()

    reply = chat_response['choices'][0]['message']['content']
    return reply

# 进行聊天
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    # 调用chatGLM接口进行对话
    response = ask_glm(user_message)

    # 返回chatGLM的回复给小程序
    return jsonify({'reply': response})

# # 描述图片
# @app.route('/process_image', methods=['POST'])
# def process_image():
#     # 接收图片文件
#     url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
#     file = request.files['image']
#     if not file:
#         return jsonify({"error": "No image file provided."}), 400

#     # 打开图片文件
#     with Image.open(file) as img:
#         # 将图片转换为Base64编码的字符串
#         img_b64 = base64.b64encode(img.tobytes()).decode('utf-8')

#     # 定义GLM大模型的API请求
#     headers = {
#         'Content-Type': 'application/json',
#         'Authorization': generate_token("2024eb0d474b66eb68053ee22932ab5e.CB4TpT2zQw4UVGwK", 1000)
#     }

#     # 将图片内容作为文本发送给模型
#     data = {
#         "model": "glm-3-turbo",
#         "messages": [{"role": "user", "content": f"描述图片内容：{img_b64}"}]
#     }

#     # 发送POST请求
#     response = requests.post(url, headers=headers, json=data)
#     chat_response = response.json()

#     # 获取模型的回复
#     reply = chat_response['choices'][0]['message']['content']

#     # 返回模型的回复给小程序
#     return jsonify({"reply": reply})

# 测试
if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 8081 , debug= True)



