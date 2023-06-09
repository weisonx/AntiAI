import sys
import json
import subprocess
import os
import openai   

# 从标准输入读取服务器传递的数据
data = sys.stdin.read()
# 将数据解析为JSON格式
request_data = json.loads(data)
# 获取请求中的参数
prompt = request_data['text']              

# {
#   "model": "gpt-3.5-turbo",
#   "messages": [{"role": "user", "content": "Hello!"}]
# }

openai.api_key = os.getenv("OPENAI_API_KEY")
completion = openai.ChatCompletion.create(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "{}".format(prompt)}
  ]
)

# {
#   "id": "chatcmpl-123",
#   "object": "chat.completion",
#   "created": 1677652288,
#   "choices": [{
#     "index": 0,
#     "message": {
#       "role": "assistant",
#       "content": "\n\nHello there, how may I assist you today?",
#     },
#     "finish_reason": "stop"
#   }],
#   "usage": {
#     "prompt_tokens": 9,
#     "completion_tokens": 12,
#     "total_tokens": 21
#   }
# }

response_data = completion.choices[0].message



# 将结果以JSON格式输出到标准输出
response_json = json.dumps(response_data)
sys.stdout.write(response_json)
sys.stdout.flush()
