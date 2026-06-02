const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const startCamBtn = document.getElementById('startCamBtn');
const captureBtn = document.getElementById('captureBtn');
const statusField = document.getElementById('statusField');

// محرك نطق النصوص
function speak(text) {
    window.speechSynthesis.cancel();
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    window.speechSynthesis.speak(utterance);
}

// تشغيل الكاميرا بدقة عالية تناسب الهواتف
startCamBtn.addEventListener('click', async () => {
    statusField.innerText = "جاري الاتصال بالكاميرا...";
    try {
        const constraints = {
            video: {
                facingMode: "environment", // تشغيل الكاميرا الخلفية للهاتف
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        statusField.innerText = "الكاميرا تعمل بنجاح! ثبت الهاتف فوق النص واضغط التقاط.";
        speak("تم تفعيل الكاميرا.");
        captureBtn.disabled = false;
    } catch (err) {
        statusField.innerText = "يرجى إعطاء صلاحية الكاميرا للمتصفح.";
        speak("فشل تشغيل الكاميرا.");
        console.error(err);
    }
});

// التقاط ومعالجة دقيقة للصورة
captureBtn.addEventListener('click', () => {
    statusField.innerText = "جاري المعالجة... انتظر 5 ثوانٍ لتحميل الذكاء الاصطناعي...";
    speak("جاري تحليل النص.");

    const context = canvas.getContext('2d');
    // ضبط أبعاد الكانفاس لتطابق أبعاد الفيديو الحقيقية بدقة
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // جودة عالية

    // تشغيل محرك الذكاء الاصطناعي
    Tesseract.recognize(
        dataUrl,
        'eng+ara', // تحميل الإنجليزية والعربية معاً
        { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
        if(!text || text.trim() === "") {
            statusField.innerText = "لم أستطع قراءة النص. يرجى تحسين الإضاءة وتقريب الكاميرا.";
            speak("لم يتم العثور على نص واضح.");
        } else {
            statusField.innerText = "النص المقروء: " + text;
            speak(text); // نطق النص المستخرج فوراً
        }
    }).catch(error => {
        statusField.innerText = "حدث خطأ في تحميل محرّك الذكاء الاصطناعي.";
        speak("حدث خطأ أثناء المعالجة.");
        console.error(error);
    });
});
