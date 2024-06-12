import torch
import torchvision
import torch.nn.functional as F
import numpy as np
import pandas as pd
from torchvision import transforms
from PIL import Image, ImageFont, ImageDraw
import os

device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
# 加载模型

class Prdiction:
    def __init__(self, modelpath,  device):
        self.modelpath = modelpath
        self.net = torch.load(self.modelpath, map_location=torch.device('cpu'))
        self.net.eval().to(device)

    def process(self,img):
        
        idx_to_labels = np.load('idx_to_labels.npy', allow_pickle=True).item() # 加载分类标签字典
        # 1.图像预处理
        # 测试集图像预处理-RCTN：缩放、裁剪、转 Tensor、归一化
        test_transform = transforms.Compose([transforms.Resize(256),
                                            transforms.CenterCrop(224),
                                            transforms.ToTensor(), 
                                            transforms.Normalize(
                                                mean=[0.485, 0.456, 0.406], 
                                                std=[0.229, 0.224, 0.225])
                                            ])
        img_pil = Image.open(img) # 读取图像
        input_img = test_transform(img_pil) # 预处理
        input_img = input_img.unsqueeze(0).to(device)

        # 2.获得分类结果
        pred_logits = self.net(input_img) 

        pred_softmax = F.softmax(pred_logits, dim=1) # 对 logit 分数做 softmax 运算

        class_index = pred_softmax.argmax(dim=1).item() # 获取分类的索引

        class_name = idx_to_labels[class_index]
        return class_name
    
if __name__ == '__main__':
    modelpath = 'models/ResNet.pth'
    img_path = 'static/testimg'

    device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

    # 创建类实例
    rs = Prdiction(modelpath, device) 

    # # 测试1   (单张图片测试)
    # images = 'static/testimg/0.jpg'
    # result = rs.process(images)
    # print(images,result)

    # 测试2 (从文件夹中读取图片)
    images = os.listdir(img_path)
    for img in images:
        img = os.path.join(img_path,img)
        # print(img)
        result = rs.process(img)
        print( img , result)