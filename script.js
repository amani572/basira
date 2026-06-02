const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');

const startCamBtn = document.getElementById('startCamBtn');
const stopCamBtn = document.getElementById('stopCamBtn');
const captureBtn = document.getElementById('captureBtn');

const readPageBtn = document.getElementById('readPageBtn');
const voiceBtn = document.getElementById('voiceBtn');

const increaseFontBtn = document.getElementById('increaseFontBtn');
const decreaseFontBtn = document.getElementById('decreaseFontBtn');

const statusField = document.getElementById('statusField');

const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');

const copyBtn = document.getElementById('copyBtn');

let lastRecognizedText = "";
let stream = null;
let currentFontSize = 1.2;

// =======================
// النطق الصوتي
// =======================

function speak(text) {

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const selectedLang =
        document.querySelector('input[name="lang"]:checked').value;

    utterance.lang =
        selectedLang === "ara"
            ? "ar-SA"
            : "en-US";

    window.speechSynthesis.speak(utterance);
}

// =======================
// تغيير اللغة
// =======================

document.querySelectorAll('input[name="lang"]').forEach(radio => {

    radio.addEventListener('change', () => {

        statusField.innerText =
            "تم تغيير اللغة بنجاح.";

    });

});

// =======================
// قراءة الصفحة
// =======================

readPageBtn.addEventListener('click', () => {

    const pageText = `
    تطبيق بصيرة الذكي.
    حالة النظام.
    ${statusField.innerText}
    `;

    speak(pageText);

});

// =======================
// تكبير النص
// =======================

increaseFontBtn.addEventListener('click', () => {

    currentFontSize += 0.2;

    statusField.style.fontSize =
        currentFontSize + "rem";

});

// =======================
// تصغير النص
// =======================

decreaseFontBtn.addEventListener('click', () => {

    if (currentFontSize > 0.8) {

        currentFontSize -= 0.2;

        statusField.style.fontSize =
            currentFontSize + "rem";

    }

});

// =======================
// تشغيل الكاميرا
// =======================

startCamBtn.addEventListener('click', async () => {

    statusField.innerText =
        "جاري فتح الكاميرا...";

    try {

        const constraints = {

            video: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }

        };

        stream =
            await navigator.mediaDevices.getUserMedia(
                constraints
            );

        video.srcObject = stream;

        statusField.innerText =
            "الكاميرا شغالة! حدد اللغة واضغط التقاط.";

        captureBtn.disabled = false;

        speak("تم تشغيل الكاميرا");

    } catch (err) {

        statusField.innerText =
            "يرجى السماح بصلاحية الكاميرا.";

        console.error(err);

    }

});

// =======================
// إيقاف الكاميرا
// =======================

stopCamBtn.addEventListener('click', () => {

    if (stream) {

        stream.getTracks().forEach(track =>
            track.stop()
        );

        video.srcObject = null;

        captureBtn.disabled = true;

        statusField.innerText =
            "تم إيقاف الكاميرا.";

        speak("تم إيقاف الكاميرا");

    }

});
// =======================
// التقاط الصورة وتحليلها
// =======================

captureBtn.addEventListener('click', () => {

    captureBtn.disabled = true;

    const selectedLang =
        document.querySelector('input[name="lang"]:checked').value;

    statusField.innerText =
        "بدء التحليل...";

    copyBtn.style.display = "none";

    progressContainer.style.display = "block";

    progressBar.style.width = "0%";
    progressBar.innerText = "0%";

    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    context.filter =
        "contrast(130%) brightness(110%)";

    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    const dataUrl =
        canvas.toDataURL('image/jpeg', 0.95);

    Tesseract.recognize(
        dataUrl,
        selectedLang,
        {
            logger: m => {

                if (m.status === 'recognizing text') {

                    const percentage =
                        Math.round(m.progress * 100);

                    progressBar.style.width =
                        percentage + "%";

                    progressBar.innerText =
                        `جاري التعرف: ${percentage}%`;
                }
            }
        }
    )
    .then(({ data: { text } }) => {

        progressContainer.style.display = "none";

        captureBtn.disabled = false;

        if (!text || text.trim() === "") {

            statusField.innerText =
                "لم أجد نصاً واضحاً، جرب مجدداً.";

            speak("لم يتم العثور على نص");

        } else {

            statusField.innerText = text;

            lastRecognizedText = text;

            copyBtn.style.display = "block";

            speak(text);

            // اهتزاز عند انتهاء القراءة
            if (navigator.vibrate) {
                navigator.vibrate(300);
            }

        }

    })
    .catch(error => {

        progressContainer.style.display = "none";

        captureBtn.disabled = false;

        statusField.innerText =
            "حدث خطأ في معالجة الصور.";

        console.error(error);

    });

});

// =======================
// نسخ النص
// =======================

copyBtn.addEventListener('click', async () => {

    try {

        await navigator.clipboard.writeText(
            lastRecognizedText
        );

        speak("تم نسخ النص");

        alert(
            "تم نسخ النص إلى الحافظة بنجاح 📋"
        );

    } catch (err) {

        alert("فشل النسخ");

        console.error(err);

    }

});

// =======================
// الأوامر الصوتية
// =======================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognition) {

    const recognition =
        new SpeechRecognition();

    recognition.lang = "ar-SA";

    recognition.continuous = false;

    recognition.interimResults = false;

    voiceBtn.addEventListener('click', () => {

        statusField.innerText =
            "استمع للأوامر الصوتية...";

        recognition.start();

    });

    recognition.onresult = (event) => {

        const command =
            event.results[0][0].transcript
            .toLowerCase();

        console.log(command);

        // تشغيل الكاميرا

        if (
            command.includes("شغل الكاميرا") ||
            command.includes("تشغيل الكاميرا")
        ) {

            startCamBtn.click();

        }

        // إيقاف الكاميرا

        else if (
            command.includes("وقف الكاميرا") ||
            command.includes("ايقاف الكاميرا")
        ) {

            stopCamBtn.click();

        }

        // التقاط صورة

        else if (
            command.includes("اقرأ النص") ||
            command.includes("التقاط")
        ) {

            captureBtn.click();

        }

        // نسخ النص

        else if (
            command.includes("انسخ النص")
        ) {

            copyBtn.click();

        }

        // قراءة الصفحة

        else if (
            command.includes("اقرأ الصفحة")
        ) {

            readPageBtn.click();

        }

        else {

            speak(
                "لم أفهم الأمر الصوتي"
            );

        }

    };

    recognition.onerror = () => {

        speak(
            "حدث خطأ في التعرف على الصوت"
        );

    };

} else {

    voiceBtn.disabled = true;

    console.warn(
        "المتصفح لا يدعم التعرف على الصوت"
    );

}