import payment from "../payment.js";

// Mock Braintree configuration for development
const mockBraintreeConfig = {
  clientToken: "sandbox_mock_client_token_12345",
  environment: "sandbox"
};

export const paymentController = async (req, res) => {
  try {
    const { number, amount, cvc, exp_month, exp_year } = req.body;
    console.log(number, amount, cvc, exp_month, exp_year);

    // 🔍 Basic Field Validation
    if (!number || !amount || !cvc || !exp_month || !exp_year) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (number, amount, cvc, exp_month, exp_year) are required.",
      });
    }

    // 🧠 Type & Format Validation (Basic)
    if (typeof number !== "string" || number.length < 16) {
      return res.status(400).json({
        success: false,
        message: "Card number must be a 16 digit .",
      });
    }

    if (typeof cvc !== "string" || cvc.length < 3) {
      return res.status(400).json({
        success: false,
        message: "CVC must be a 3 digit .",
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid number greater than 0.",
      });
    }

    // 🔁 Call Payment Logic
    const result = await payment(number, cvc, exp_month, exp_year, amount);

    // ⚠️ Stripe Error (if any)
    if (result?.error) {
      return res.status(400).json({
        success: false,
        message: "Stripe error",
        error: result.error,
      });
    }

    // ✅ Success Response
    res.status(200).json({
      success: true,
      message: "Payment processed successfully.",
      result,
    });
  } catch (error) {
    console.error("🔥 PAYMENT CONTROLLER ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong while processing payment.",
      error: error.message,
    });
  }
};

// Braintree Token Controller
export const getBraintreeToken = async (req, res) => {
  try {
    // For development, return a mock client token
    res.status(200).json({
      success: true,
      clientToken: mockBraintreeConfig.clientToken,
      environment: mockBraintreeConfig.environment
    });
  } catch (error) {
    console.error("🔥 BRAINTREE TOKEN ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate Braintree client token",
      error: error.message,
    });
  }
};

// Braintree Payment Controller
export const processBraintreePayment = async (req, res) => {
  try {
    const { nonce, amount } = req.body;
    
    if (!nonce || !amount) {
      return res.status(400).json({
        success: false,
        message: "Payment nonce and amount are required"
      });
    }

    // Mock payment processing for development
    const mockResult = {
      id: `txn_${Date.now()}`,
      status: "submitted_for_settlement",
      amount: amount,
      currencyIsoCode: "INR",
      createdAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      transaction: mockResult
    });

  } catch (error) {
    console.error("🔥 BRAINTREE PAYMENT ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Payment processing failed",
      error: error.message,
    });
  }
};
