import Stripe from "stripe";

// Lazy/safe Stripe initialization to avoid crashing server when key is missing
let stripeInstance = null;
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || typeof key !== "string" || key.trim() === "") {
    return null;
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
};

const payment = async (number, cvc, exp_month, exp_year, amount) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return { error: "Payment service not configured. Please set STRIPE_SECRET_KEY." };
    }
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number,
        exp_month,
        exp_year,
        cvc,
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in paisa
      currency: "pkr", // always lowercase
      payment_method: paymentMethod.id,
      confirm: true,
      return_url: "http://localhost:5173/", // for redirect-based payments
    });

    return paymentIntent;
  } catch (error) {
    console.error("Stripe payment error:", error);
    return { error: error.message };
  }
};

export default payment;
