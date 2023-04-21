export const utils = {

  // Play sound
  playSound: function (audio: HTMLAudioElement) {
    if (!this.isMobileDevice()) {
      audio.play();
    }
  },

  // Check if device is mobile
  isMobileDevice: function() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  },

  // Copy value of input to clipboard and focus element
  copyToClipboard: function (id: string) {
    var copyText = document.getElementById(id) as HTMLInputElement;
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
  },

  // Check line items values
  checkLineItems(handle: string): void {
    const inputs = document.querySelectorAll<HTMLInputElement>(
      `.custom-input_${handle}`
    );
    const inputsArr = Array.from(inputs);
    const requiredFields = inputsArr.filter((inp) => inp.required);

    if (requiredFields.some((field) => field.value === "")) {
      this.incomplete_fields = true;
    } else {
      this.incomplete_fields = false;
    }
  },
  
};