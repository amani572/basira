const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const startCamBtn = document.getElementById('startCamBtn');
const captureBtn = document.getElementById('captureBtn');
const statusField = document.getElementById('statusField');

// محرك نطق النصوص
function speak(text) {
    window.speechSynthesis.cancel();
    let utterance = new SpeechSynthesisUtterance(text);
    
    // تحديد لغة النطق بناءً على خيار المستخدم
    const selectedLang = document.querySelector('input[name="lang"]:checked').value;
    if (selectedLang === 'ara') {
        utterance.lang = 'ar-SA';
    } else {
        utterance.lang = 'en-US';
    }
    
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
        statusField.innerText = "الكاميرا تعمل بنجاح! حدد لغة النص، ثم ثبت الهاتف واضغط التقاط.";
        speak(document.querySelector('input[name="lang"]:checked').value === 'ara' ? "تم تفعيل الكاميرا" : "Camera activated");
        captureBtn.disabled = false;
    } catch (err) {
        statusField.innerText = "يرجى إعطاء صلاحية الكاميرا للمتصفح.";
        console.error(err);
    }
});

// التقاط ومعالجة دقيقة للصورة
captureBtn.addEventListener('click', () => {
    statusField.innerText = "جاري تحليل النص... يرجى الانتظار ثوانٍ...";
    
    const selectedLang = document.querySelector('input[name="lang"]:checked').value;
    speak(selectedLang === 'ara' ? "جاري تحليل النص" : "Analyzing text");

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // تشغيل محرك الذكاء الاصطناعي بناءً على اللغة المختارة فقط لمنع التداخل والرموز
    Tesseract.recognize(
        dataUrl,
        selectedLang, 
        { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
        if(!text || text.trim() === "") {
            statusField.innerText = selectedLang === 'ara' ? "لم أستطع قراءة النص. تأكد من الإضاءة وقرب الكاميرا." : "No clear text found. Please check lighting.";
            speak(selectedLang === 'ara' ? "لم يتم العثور على نص واضح" : "No text found");
        } else {
            statusField.innerText = "النص المقروء: " + text;
            speak(text); // نطق النص المستخرج فوراً بالصوت الحقيقي
        }
    }).catch(error => {
        statusField.innerText = "حدث خطأ في معالجة الذكاء الاصطناعي.";
        console.error(error);
    });
});