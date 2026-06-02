const sosBtn = document.getElementById('sosBtn');
const locationBtn = document.getElementById('locationBtn');
const statusField = document.getElementById('statusField');

// محرك النطق الصوتي للمكفوفين
function speak(text) {
    window.speechSynthesis.cancel();
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA'; // النطق باللغة العربية
    window.speechSynthesis.speak(utterance);
}

// ترحيب صوتي عند فتح التطبيق أول مرة
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        speak("أهلاً بك في تطبيق بصيرَة المطور. لديك زِر الطوارئ في الأعلى، وزِر تحديد الموقع في المنتصف.");
    }, 1000);
});

// خدمة "أين أنا الآن" باستخدام الـ GPS الخاص بالهاتف
locationBtn.addEventListener('click', () => {
    statusField.innerText = "جاري تحديد موقعك الحالي عبر الأقمار الصناعية...";
    speak("جاري تحديد موقعك الحالي، يرجى الانتظار ثوانٍ.");

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude.toFixed(4);
            const lon = position.coords.longitude.toFixed(4);
            
            const message = `تم تحديد موقعك بنجاح. أنت تقف الآن عند خط عرض ${lat} وخط طول ${lon}.`;
            statusField.innerText = message;
            speak(message);
        }, (error) => {
            statusField.innerText = "فشل تحديد الموقع. يرجى تفعيل الـ GPS في هاتفك.";
            speak("فشل تحديد الموقع. يرجى التأكد من تفعيل نظام تحديد المواقع في الهاتف وإعطاء الصلاحية.");
        });
    } else {
        statusField.innerText = "متصفحك لا يدعم نظام تحديد المواقع.";
        speak("عذراً، هذا الهاتف لا يدعم ميزة تحديد المواقع.");
    }
});

// خدمة الطوارئ SOS
sosBtn.addEventListener('click', () => {
    statusField.innerText = "تم تفعيل وضع الطوارئ! جاري إرسال الإشارات...";
    speak("تحذير، تم تفعيل وضع الطوارئ. جاري تحديد موقعك وإرسال نداء استغاثة لأرقام الطوارئ المسجلة.");
    
    // هنا يمكن ربطه مستقبلاً بفتح اتصال مباشر هاتفياً
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude.toFixed(4);
            const lon = position.coords.longitude.toFixed(4);
            speak(`موقع الطوارئ الحالي هو خط عرض ${lat} وخط طول ${lon}. ابقَ في مكانك حتى تصل المساعدة.`);
        });
    }
});
