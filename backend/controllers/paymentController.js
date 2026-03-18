const Razorpay = require('razorpay');

exports.createOrder = async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: 1000, 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(500).json({ success: false, message: "Order creation failed" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
