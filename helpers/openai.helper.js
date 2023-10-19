let OpenAI = require('openai').OpenAI
let openai = new OpenAI({ apiKey: process.env.OPEN_AI });


module.exports = {
    fastAnswer: async function (text) {
        let completion = await openai.chat.completions.create({
            prompt: text,
            model: "gpt-3.5-turbo",
        });
        return { data: completion.choices[0].message.content, id: completion.id }
    },
    fastAnswerMessages: async function (messages, id = null) {
        if (id && id != '' && typeof id == 'string') {
            //TODO SUMARY MESSAGES OLD
        }
        let completion = await openai.chat.completions.create({
            messages: messages,
            model: 'gpt-4',//"gpt-3.5-turbo",
            temperature: 0.2,
            max_tokens: 2048
        });
        return { data: completion.choices[0].message.content, id: completion.id }
    },
    functionTemplate: async function (nameFunction, description = '', parameters, required = []) {
        /* EXAMPLE OF PARAMETERS

        "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},

                    */
        return {
            "name": nameFunction,
            "description": description,
            "parameters": {
                "type": "object",
                "properties": parameters,
                "required": required,
            },
        };
    },
    fastAnswerFunction: async function (messages, functions, callBack, id) {

        if (id && id != '' && typeof id == 'string') {
            //TODO SUMARY MESSAGES OLD
        }

        let completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            functions: functions,
            function_call: "auto",
        });
        const responseMessage = completion.choices[0].message;
        if (responseMessage.function_call) {

            const availableFunctions = {
                cb_func: callBack,
            };
            const functionName = responseMessage.function_call.name;
            const functionToCall = availableFunctions[functionName];
            const functionArgs = JSON.parse(responseMessage.function_call.arguments);
            console.log('ARGUMENTOS', functionArgs)
            const functionResponse = functionToCall(
                functionArgs.location,
                functionArgs.unit,
            );

            messages.push(responseMessage);
            messages.push({
                "role": "function",
                "name": functionName,
                "content": functionResponse,
            });

            const secondResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: messages,
            });

            return { data: secondResponse.choices[0].message.content, id: secondResponse.id }


        } else {
            throw new Error('We cannot solve function')
        }
    }
}
