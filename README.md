# ⚡ Lightning Model
It offers token-based or request-based payment options, allowing users to choose the most cost-effective approach for their usage patterns for LLM, which utilizes Lightining Network for near-instant, low-fee micropayments.

## Local Installation
### Prerequisites
```
Python
Nodejs
Redis
```
### Install & Set up Redis
Refer to [Docs](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/) to install it on MacOS/Windows/Linux.

Example:
```
sudo apt-get install redis 

sudo systemctl enable redis-server
sudo systemctl start redis-server
```
### Setting Up .env & Voltage.cloud Keys
#### There are two .env files:

First `.env file` in root folder:
```
VITE_GEMINI_API_KEY=KEY_HERE   #Paste your Gemini-API-Key-here

VITE_API_URL=http://localhost:8000/api/v1

```

Second `.env file` in cd backend:
```
# Database configuration
DATABASE_URL=sqlite:///./app.db

# API Keys
GEMINI_API_KEY=KEY_HERE     #Paste your Gemini-API-Key-here

REDIS_HOST=localhost
REDIS_PORT=6379
```

### Keys for interacting with voltage.cloud:
#### Go to src/services/lndService.js and at top of file:
```
const REST_HOST = 'yournodename.t.voltageapp.io:8080';      #Paste your API enpoint of your TestnetNode of Lightning Node
const MACAROON = 'HEX_KEY_HERE';       #Visit Macaroon Bakery and Paste Hex key here(Admin)

```

### Setting up
```
git clone https://github.com/Hack-Archive/Lightning-Model.git
cd Lightning-Model
```
#### Open Two Terminals:
`In terminal 1`

Run these commands:
```
npm install
npm run dev
```

`In terminal 2`

Navigate to Backend:
```
cd backend/
```
Run these commands:
```
python3 -m venv venv 
source ./venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
# Working
### We have used usage_metadata is used in the chat message endpoint to track token usage from the Gemini API.
```
result = chat.send_message(chat_request.message)
response_text = result.text

usage_metadata = getattr(result, 'usage_metadata', None)

total_tokens = 0
output_tokens = 0

if usage_metadata:
    prompt_token_count = getattr(usage_metadata, 'prompt_token_count', 0)
    candidates_token_count = getattr(usage_metadata, 'candidates_token_count', 0)
    total_tokens = prompt_token_count + candidates_token_count
    input_tokens = prompt_token_count
    output_tokens = candidates_token_count
else:
    output_tokens = len(response_text) // 4
    total_tokens = input_tokens + output_tokens
```
It includes metadata about token consumption:

`prompt_token_count`: The number of tokens used in the user's input message.

`candidates_token_count`: The number of tokens generated in the AI's response.

### Token Bucket Algorithm Implementation

The system implements a Redis-backed Token Bucket algorithm for metered API access control. Each session maintains a virtual token reservoir with configurable capacity and replenishment rate. The implementation tracks three key metrics: instantaneous token availability (for rate limiting), cumulative consumption (for quota enforcement), and time-based replenishment. When a request is processed, the algorithm atomically verifies sufficient token availability, deducts the appropriate amount, and records usage metrics using Redis pipelines for transactional consistency. Token replenishment follows a continuous time-based function calculated as (elapsed_time * replenishment_rate), constrained by maximum capacity.

# FlowChart

![Untitled-2025-04-05-2019](https://github.com/user-attachments/assets/3755f241-3826-4f7e-9feb-b5bb2ba3c439)


