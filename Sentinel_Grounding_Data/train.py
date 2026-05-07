import torch
import torch.nn as nn
from torch.nn import functional as F

# 1. Hyperparameters (Settings for your AI)
batch_size = 32 
block_size = 8 # How many characters the AI looks at to predict the next
max_iters = 3000
learning_rate = 1e-3
device = 'cuda' if torch.cuda.is_available() else 'cpu' # Uses your GPU if you have one

# 2. Load your text file
with open('input.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# 3. Create a Vocabulary (all unique characters in your text)
chars = sorted(list(set(text)))
vocab_size = len(chars)
stoi = { ch:i for i,ch in enumerate(chars) }
itos = { i:ch for i,ch in enumerate(chars) }
encode = lambda s: [stoi[c] for c in s] # string to numbers
decode = lambda l: ''.join([itos[i] for i in l]) # numbers to string

# 4. The "Bigram" Model (The simplest form of a GPT)
class SimpleGPT(nn.Module):
    def __init__(self, vocab_size):
        super().__init__()
        self.token_embedding_table = nn.Embedding(vocab_size, vocab_size)

    def forward(self, idx, targets=None):
        logits = self.token_embedding_table(idx)
        if targets is None:
            loss = None
        else:
            B, T, C = logits.shape
            logits = logits.view(B*T, C)
            targets = targets.view(B*T)
            loss = F.cross_entropy(logits, targets)
        return logits, loss

model = SimpleGPT(vocab_size).to(device)

# Now you would add the "Training Loop" here to make it learn...