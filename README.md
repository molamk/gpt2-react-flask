# How to generate text with OpenAI's GPT-2, React and Flask

## Introduction

In this tutorial, we'll build a Flask & React app with GPT-2 capabilities. We'll go step by step, by tweaking the generator's _"interface"_, then we'll build the Flask server and finally the React frontend.

By the end of this tutorial, here's what our app should look like:

![GPT-2 Generator with React & Flask](./screenshot.png)

## Generating text with GPT-2

Thanks to [pytorch-transformers](https://github.com/huggingface/pytorch-transformers), it's actually really easy to play with state of the art NLP models. We'll use a recipe found in `pytorch-transformers/examples/run_generation.py` as a template for our app.

First let's install our dependencies

```bash
# Download the transformers package
pip3 install pytorch-transformers

# Get only the text generation file from the repository
wget https://raw.githubusercontent.com/huggingface/pytorch-transformers/master/examples/run_generation.py
```

Now that we have our generation script, we need to change it a bit so it plays nice with our Flask app. The script itself normally as a CLI tool with arguments, like this.

```bash
python3 ./run_generation.py \
    --model_type=gpt2 \
    --length=20 \
    --model_name_or_path=gpt2 \
    --promt="Hello world"
```

But since we want to call the text generation function from our Flask app, some changes are needed. First let's rename `main()` to `generate_text()` and give it some arguments. Those arguments are exactly the some as the ones we normally give if we run it directly in a shell. Here's what it looks like

```python
def generate_text(
    padding_text=None,
    model_type='gpt2',
    model_name_or_path='gpt2',
    prompt='',
    length=20,
    temperature=1.0,
    top_k=0,
    top_p=0.9,
    no_cuda=True,
    seed=42,
):
    # Set the seed manually
    np.random.seed(seed)
    torch.manual_seed(seed)
    if n_gpu > 0:
        torch.cuda.manual_seed_all(seed)

    # The rest of the old main() code
    # We just need to replace args.* with
    # the corresponding function's arguments
    ...
```

That's it! Now we're ready to expose our feature through a REST API with Flask.

## Building the Flask app

Our server will be pretty minimalistic, with only one endpoint that handle a `POST` request. In the body, we will provide the `text` which will serve as a _"prompt"_ for GPT-2 to generate stuff. We'll also give a `model` which can be one the 3 GPT-2 models, namely the small (117M), medium (345M) and large (774M).

```python
from flask import Flask, abort, jsonify, request
from flask_cors import CORS, cross_origin

from .run_generation import generate_text

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route("/generate", methods=['POST'])
@cross_origin()
def get_gen():
    data = request.get_json()

    if 'text' not in data or len(data['text']) == 0 or 'model' not in data:
        abort(400)
    else:
        text = data['text']
        model = data['model']

        result = generate_text(
            model_type='gpt2',
            length=100,
            prompt=text,
            model_name_or_path=model
        )

        return jsonify({'result': result})
```

## Front-end work

Now that we set up our Flask server, it's time to build to front-end. We'll have a simple form that takes a `model` and a textarea that inputs the `text` (prompt). I also used [material-ui](https://material-ui.com) to have fancy form controls. Alright, let's set up our React app

```bash
# Create the app
create-react-app gpt2-frontend
cd gpt2-frontend

# Add some dependencies
yarn add @material-ui/core node-sass axios
```

We'll also use [React Hooks](https://reactjs.org/docs/hooks-intro.html) to handle the state. I shamelessly copy-pasted API related boilerplate from [this very thourough article](https://medium.com/@jaryd_34198/seamless-api-requests-with-react-hooks-part-2-3ab42ba6ad5c). Now here's what our `App.js` looks like

```jsx
function App() {
  const [text, setText] = useState("");
  const [model, setModel] = useState('gpt2');
  const [generatedText, postGenerateText] = postGenerateTextEndpoint();

  const generateText = () => {
    postGenerateText({ text, model, userId: 1 });
  }

  return (
    <div className='app-container'>
      <form noValidate autoComplete='off'>
        <h1>React GPT-2</h1>
        <SelectBox model={model} setModel={setModel} />
        <TextBox text={text} setText={setText} />
        <Button onClick={generateText} />
      </form>

      {generatedText.pending &&
        <div className='result pending'>Please wait</div>}

      {generatedText.complete &&
        (generatedText.error ?
          <div className='result error'>Bad Request</div> :
          <div className='result valid'>
            {generatedText.data.result}
          </div>)}
    </div>
  );
}
```
