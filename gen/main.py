import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

modn = "ai-forever/rugpt3small_based_on_gpt2"
tokenizer = AutoTokenizer.from_pretrained(modn)
print("py: create tokenizer")
model = AutoModelForCausalLM.from_pretrained(modn)
print("py: create model")
def gen(ctx):
    inputs = tokenizer(ctx, return_tensors='pt')
    print("py: tokenizer done")
    generated_token_ids = model.generate(
        **inputs,
        top_k=10,
        top_p=0.95,
        num_beams=3,
        num_return_sequences=3,
        do_sample=True,
        no_repeat_ngram_size=2,
        temperature=2.0,
        repetition_penalty=1.2,
        length_penalty=1.0,
        eos_token_id=50257,
        max_new_tokens=100
    )
    print("py: generated token ids")
    context_with_response = [tokenizer.decode(sample_token_ids) for sample_token_ids in generated_token_ids]
    print("py: generated response")
    return context_with_response[0][len(ctx):]
