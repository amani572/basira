const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const startCamBtn = document.getElementById('startCamBtn');
const captureBtn = document.getElementById('captureBtn');
const statusField = document.getElementById('statusField');

// 1. محرك نطق النصوص باللغة العربية
function speak(text) {
    window.speechSynthesis.cancel();
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    window.speechSynthesis.speak(utterance);
}

// 2. تشغيل بث الكاميرا الحقيقي للجهاز
startCamBtn.addEventListener('click', async () => {
    statusField.innerText = "جاري الاتصال بالكاميرا وطلب الإذن...";
    try {
        // فتح الكاميرا الحقيقية (الخلفية إن وجدت في الهاتف أو كاميرا اللابتوب)
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        statusField.innerText = "الكاميرا تعمل بنجاح! وجهها نحو أي نص واضغط على زر الالتقاط.";
        speak("تم تفعيل الكاميرا بنجاح.");
        captureBtn.disabled = false;
    } catch (err) {
        statusField.innerText = "خطأ: يرجى التحقق من إعطاء صلاحية الكاميرا للمتصفح.";
        speak("عذراً، فشل تشغيل الكاميرا.");
        console.error(err);
    }
});

// 3. التقاط اللقطة الحية وتحليل الكلمات بالذكاء الاصطناعي
captureBtn.addEventListener('click', () => {
    statusField.innerText = "جاري التقاط الصورة وتحليل النص... يرجى الانتظار ثوانٍ قليلة";
    speak("جاري معالجة اللقطة وتحليل الكلمات.");

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // أخذ لقطة فورية مدمجة من الكاميرا الحية
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    
    // تحويل اللقطة لصيغة رقمية يفهمها محرك الذكاء الاصطناعي
    const dataUrl = canvas.toDataURL('image/png');

    // تشغيل نظام الـ OCR لقراءة العربية والإنجليزية معاً
    Tesseract.recognize(
        dataUrl,
        'ara+eng', 
        { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
        if(text.trim() === "") {
            statusField.innerText = "لم يتم رصد كلمات واضحة، يرجى تقريب النص وإعادة المحاولة.";
            speak("لم أستطع رصد أي نص واضح، حاول مرة أخرى.");
        } else {
            statusField.innerText = "النص المقروء: " + text;
            speak("النص المكتشف هو: " + text);
        }
    }).catch(error => {
        statusField.innerText = "عذراً، حدث خطأ أثناء التحليل الفني للصورة.";
        speak("حدث خطأ أثناء معالجة الصورة.");
        console.error(error);
    });
});