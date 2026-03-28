const { onRequest } = require("firebase-functions/v2/https");
const { Groq } = require("groq-sdk");

// جلب المفتاح بأمان من إعدادات Firebase
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.summarizeText = onRequest({ cors: true }, async (req, res) => {
    // 1. التأكد من أن الطلب يحتوي على بيانات
    const { text, style } = req.body;

    if (!text) {
        return res.status(400).send("يرجى إدخال النص المراد تلخيصه.");
    }

    // 2. تحديد الـ Prompt بناءً على الشخصية التي اخترتها (سابقاً لـ Claude)
    let systemPrompt = "";
    if (style === "jahiiz") {
        systemPrompt = "أنت الجاحظ، لخص النص ببيان وفصاحة وترادف لغوي بديع.";
    } else if (style === "mutanabbi") {
        systemPrompt = "أنت المتنبي، لخص النص بقوة وبلاغة وحكمة موجزة.";
    } else {
        systemPrompt = "أنت مساعد ذكي، لخص النص بأسلوب مباشر وبسيط.";
    }

    try {
        // 3. الاتصال بـ Groq بدلاً من Claude
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text }
            ],
            model: "llama-3.3-70b-versatile", // أقوى نموذج للعربية في Groq حالياً
        });

        const summary = chatCompletion.choices[0].message.content;
        res.json({ result: summary });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("حدث خطأ في عملية التلخيص.");
    }
});
