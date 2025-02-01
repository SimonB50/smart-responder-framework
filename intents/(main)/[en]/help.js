const intent = {
  samples: [
    "How to use SRF?",
    "How to use Smart Response Framework?",
    "Can you help me with using SRF?",
    "Help me with SRF",
    "How to create responders?",
    "Give me instructions on how to use SRF",
  ],
  triggerActions: [],
  generateResponse: async (intent, response) => {
    return "All instructions on how to use Smart Response Framework can be found in the project documentation on github.";
  },
};

export default intent;
