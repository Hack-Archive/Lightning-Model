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
cd Backend/
```
Run these commands:
```
python3 -m venv venv 
source ./venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
