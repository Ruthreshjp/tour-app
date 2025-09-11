import Stripe from "stripe";
// ✅ Good (using env variable):
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// your secret key here

const payment = async (number, cvc, exp_month, exp_year, amount) => {
  try {
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
