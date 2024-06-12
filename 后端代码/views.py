from flask import jsonify, request
from werkzeug.utils import secure_filename
from datetime import datetime
from flask import Flask
import uuid
import sys
import cv2
import json
import time
import jwt
import requests

from utils.ResNet_model import *

app = Flask(__name__)

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




# 保存app相关的配置: 文件上传路径
app.config['IMG'] = os.path.join(os.path.dirname(__file__), 'static/images')  # 当前文件的根目录,指定保存文件的目录
app.config['MODEL'] = os.path.join(os.path.dirname(__file__), 'models')  


# 设置可上传的文件类型,以防用户误操作，需要检查文件后缀
ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg']  
def allowed_file(filename):
    # 把文件名从右向左以'.'分割，取第二个元素，判断是否在ALLOWED_EXTENSIONS中
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

# 添加路由
@app.route('/predict', methods=['GET','POST'])
def get_pre():
    file_data = request.files['file']
    if file_data and allowed_file(file_data.filename): # 得到当前数据，并且该文件名合法
        filename = secure_filename(file_data.filename) # 确保文件名安全，防止目录遍历攻击
        file_uuid = str(uuid.uuid4().hex) # 生成唯一识别码
        time_now = datetime.now() # 上传时间
        filename = time_now.strftime("%Y%m%d%H%M%S") + '_' + file_uuid + '_' + filename # 不会有重复的文件名
        file_data.save(os.path.join(app.config['IMG'] , filename)) # 存放路径 ， 被存放文件名


        # 获取服务端本地路径
        src_path = os.path.join(app.config['IMG'], filename)
        modelpath = os.path.join(app.config['MODEL'], 'ResNet.pth')
        device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

        rs = Prdiction(modelpath, device)
        im = src_path
        result = rs.process(im) # 得到结果
        print(result)
        return result
    
    data = {
        "code" : 1,
        "msg" : u"文件格式不允许"
    }
    return json.dumps(data, ensure_ascii=False)


@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    # 调用chatGLM接口进行对话
    response = ask_glm(user_message)

    # 返回chatGLM的回复给小程序
    return jsonify({'reply': response})


# 测试
if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 8081 , debug= True)


