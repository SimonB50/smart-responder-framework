const intent = {
  samples: [
    "What is Smart Response Framework?",
    "What is the Smart Response Framework?",
    "What is SRF?",
    "What SRF can do?",
  ],
  triggerActions: [],
  generateResponse: async (intent, response) => {
    return "Smart Responder Framework (SRF) is a framework for building smart responders for support agents or other types of chatbots. It's powered by **Natural Language Processing** which allows it to understand the messages and properly respond to them while not being resource-intensive compared to using Machine Learning models.";
  },
};

export default intent;
