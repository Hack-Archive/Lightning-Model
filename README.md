# Lightning Model
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


