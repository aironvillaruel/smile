<script>
import { nextTick } from "vue";
import Modal from "../components/Modal.vue";
import Toast from "primevue/toast";
export default {
  components: {
    Modal,
  },
  data() {
    return {
      stream: null,
      selectedFilter: "none", // Default filter
      capturedImages: [], // Array to store captured images
      timerActive: false, // Flag to indicate if the timer is active
      countdown: 5, // Initial countdown value (5 seconds)
      numberOfResults: 1, // Default number of result divs (will change when clicked)
      autoCaptureInterval: null, // To hold the interval ID for auto capture
      countdownInterval: null, // To hold the interval ID for countdown
      modalRef: null,
      selectedColor: "bg-rose-400",
      selectedOrientation: "flex-row",
      recognition: null,
      isMirrored: true,
      isDropdownVisible: false,
      isStickerClicked: false,
      isStickerClickedCol: false,
      imageFolder: "",
      activeSticker: null,
      processedImage: false,
    };
  },
  methods: {
    toggleDropdown() {
      this.isDropdownVisible = !this.isDropdownVisible;
    },
    // Method to set the number of results dynamically
    setNumberOfResults(count) {
      this.numberOfResults = count;
      this.capturedImages = []; // Reset captured images each time number of results is set
      this.countdown = 5; // Reset countdown
    },

    // Start the auto capture process
    startAutoCapture(count) {
      this.numberOfResults = count;
      this.capturedImages = []; // Reset captured images array
      this.timerActive = true;

      // Set an interval to auto capture and countdown
      this.autoCaptureInterval = setInterval(() => {
        console.log(this.numberOfResults);
        console.log(this.capturedImages.length);

        if (this.capturedImages.length < this.numberOfResults) {
          if (this.countdown > 0) {
            this.countdown -= 1; // Decrement countdown every second
            this.displayCountdown = this.countdown;
          } else {
            this.capture(); // Capture image at the end of countdown
            this.displayCountdown = null;
          }
        } else {
          clearInterval(this.autoCaptureInterval); // Stop the interval when number of results is met
          this.timerActive = false; // Stop the timer
          this.processedImage = true;
          setTimeout(() => {
            this.processedImage = false; // Hide the div after 2 seconds
          }, 2000);
          this.startRecognition();
        }
      }, 1000); // Update countdown every second
    },

    // Method to start the countdown
    startCountdown() {
      // Clear any existing countdown interval before starting a new one
      if (this.countdownInterval) clearInterval(this.countdownInterval);

      // Start countdown interval
      this.countdownInterval = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown -= 1; // Decrement countdown every second
        } else {
          // Reset countdown and capture image
          this.countdown = 5;
          if (this.capturedImages.length < this.numberOfResults) {
            this.capture(); // Capture image at the end of countdown
          }
        }
      }, 1000); // Update countdown every second
    },

    capture() {
      const videoElement = this.$refs.video;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas dimensions to match video dimensions
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      // Apply horizontal flip (mirror effect) by scaling the context
      ctx.scale(-1, 1); // Flip horizontally
      ctx.translate(-canvas.width, 0); // Translate the canvas to keep the flipped image within bounds

      // Draw the current video frame onto the canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Convert the canvas to an image URL
      const capturedImage = canvas.toDataURL("image/png");

      // Push the captured image to the capturedImages array
      if (this.capturedImages.length < this.numberOfResults) {
        this.capturedImages.push(capturedImage);
        console.log(this.countdown);
      }

      this.countdown = 5; // Reset the countdown for next capture
    },

    toggleMirrorEffect() {
      this.isMirrored = !this.isMirrored; // Toggle the mirror effect
      const videoElement = this.$refs.video;
      videoElement.style.transform = this.isMirrored ? "scaleX(-1)" : "scaleX(1)"; // Update the video style
    },
    // Method to start the camera
    async startCamera() {
      try {
        // Request access to the user's camera
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });

        // Attach the stream to the video element
        const videoElement = this.$refs.video;
        videoElement.srcObject = this.stream;

        // Apply mirror effect conditionally based on the `isMirrored` state
        videoElement.style.transform = this.isMirrored ? "scaleX(-1)" : "scaleX(1)"; // Mirror or un-mirror
      } catch (error) {
        console.error("Error accessing camera: ", error);
      }
    },
    // Method to stop the camera stream
    stopCamera() {
      if (this.stream) {
        // Stop all tracks of the stream (to stop the camera)
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }
    },

    openModal() {
      if (this.capturedImages.length === 0) {
        console.log("no image");
      } else {
        console.log("has image");
        nextTick(() => {
          // Ensure the modal component is rendered and available
          if (this.$refs.modalRef) {
            this.$refs.modalRef.openModal(); // Call openModal method on the modal reference
          }
        });
      }
    },

    startRecognition() {
      this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      this.recognition.lang = "en-US";
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
      this.recognition.continuous = true; // Keep listening continuously

      // Handle the result of speech recognition
      this.recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("You said:", transcript);

        // Check if the user said "smile"
        if (transcript.includes("smile")) {
          const count = this.numberOfResults; // Define the count (you can adjust based on your need)
          this.startAutoCapture(count); // Start capturing images

          // Stop speech recognition after detecting "smile"
          this.recognition.stop();
        }
      };

      // Handle speech recognition errors
      this.recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
      };

      // Start listening for speech
      this.recognition.start();
    },

    downloadCollage() {
      // Helper function to draw images with borders on the canvas
      const drawImageWithBorder = (
        image,
        x,
        y,
        width,
        height,
        borderThickness,
        borderColor,
        ctx,
        filter
      ) => {
        const aspectRatio = image.width / image.height;
        let adjustedWidth = width - borderThickness;
        let adjustedHeight = height - borderThickness;

        if (adjustedWidth / adjustedHeight > aspectRatio) {
          adjustedWidth = adjustedHeight * aspectRatio;
        } else {
          adjustedHeight = adjustedWidth / aspectRatio;
        }

        const offsetX = (width - adjustedWidth) / 2;
        const offsetY = (height - adjustedHeight) / 2;

        ctx.lineWidth = borderThickness;
        ctx.strokeStyle = borderColor;
        ctx.strokeRect(x, y, width, height);

        ctx.filter = filter;
        ctx.drawImage(image, x + offsetX, y + offsetY, adjustedWidth, adjustedHeight);
        ctx.filter = "none";
      };

      // Helper function to create and load an image, then call a callback when it's loaded
      const loadImage = (src, callback) => {
        const img = new Image();
        img.src = src;
        img.onload = () => callback(img);
        img.onerror = (err) => {
          console.error("Failed to load image:", src, err);
        };
      };

      // Get the video element to determine its dimensions
      const videoElement = this.$refs.video;
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;

      // Canvas setup
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const imageWidth = videoWidth;
      const imageHeight = videoHeight;
      const borderThickness = 100;

      let borderColor;
      // Assign borderColor based on selectedColor
      switch (this.selectedColor) {
        case "bg-rose-400":
          borderColor = "#fb7185";
          break;
        case "bg-red-400":
          borderColor = "#f87171";
          break;
        case "bg-pink-400":
          borderColor = "#f472b6";
          break;
        case "bg-blue-400":
          borderColor = "#60a5fa";
          break;
        case "bg-green-400":
          borderColor = "#4ade80";
          break;
        case "bg-yellow-400":
          borderColor = "#fbbf24";
          break;
        case "bg-amber-400":
          borderColor = "#f59e0b";
          break;
        case "bg-cyan-400":
          borderColor = "#22d3ee";
          break;
        case "bg-fuchsia-400":
          borderColor = "#d946ef";
          break;
        case "bg-purple-400":
          borderColor = "#9f7aea";
          break;
        case "bg-orange-400":
          borderColor = "#fb923c";
          break;
        default:
          borderColor = "#fb7185"; // Default to "rose" color
      }

      const totalImages = this.capturedImages.length;

      let collageWidth, collageHeight;

      // Determine collage size based on orientation
      if (this.selectedOrientation === "flex-row") {
        collageWidth = totalImages * imageWidth;
        collageHeight = imageHeight;
      } else if (this.selectedOrientation === "flex-col") {
        collageWidth = imageWidth;
        collageHeight = totalImages * imageHeight;
      }

      canvas.width = collageWidth;
      canvas.height = collageHeight;

      let imagesLoaded = 0;
      let stickersLoaded = 0;

      const stickers = [
        {
          src: `${this.imageFolder}/cc1.png`,
          x: collageWidth * 0.01,
          y: collageHeight - 150,
          width: 100,
          height: 100,
        },
        {
          src: `${this.imageFolder}/cc6.png`,
          x: collageWidth - 600,
          y: collageHeight * 0.02,
          width: 100,
          height: 100,
        },
        {
          src: `${this.imageFolder}/cc3.png`,
          x: collageWidth - 100,
          y: collageHeight - 100,
          width: 100,
          height: 100,
        },
        {
          src: `${this.imageFolder}/cc4.png`,
          x: collageWidth * 0.5,
          y: collageHeight * 0.01,
          width: 100,
          height: 100,
        },
        {
          src: `${this.imageFolder}/cc5.png`,
          x: collageWidth * 0.1,
          y: collageHeight * 0.01,
          width: 100,
          height: 100,
        },
        {
          src: `${this.imageFolder}/cc2.png`,
          x: collageWidth * 0.6,
          y: collageHeight - 150,
          width: 100,
          height: 100,
        },
      ];

      const loadAllStickers = (callback) => {
        stickers.forEach((sticker) => {
          loadImage(sticker.src, (stickerImage) => {
            const stickerWidth = Math.min(sticker.width, stickerImage.width);
            const stickerHeight = Math.min(sticker.height, stickerImage.height);
            ctx.drawImage(stickerImage, sticker.x, sticker.y, stickerWidth, stickerHeight);
            stickersLoaded++;

            if (stickersLoaded === stickers.length) {
              callback();
            }
          });
        });
      };

      const drawImages = () => {
        this.capturedImages.forEach((imageUrl, index) => {
          loadImage(imageUrl, (image) => {
            let x, y;

            if (this.selectedOrientation === "flex-row") {
              x = index * imageWidth;
              y = 0;
            } else if (this.selectedOrientation === "flex-col") {
              x = 0;
              y = index * imageHeight;
            }

            drawImageWithBorder(
              image,
              x,
              y,
              imageWidth,
              imageHeight,
              borderThickness,
              borderColor,
              ctx,
              this.selectedFilter
            );

            imagesLoaded++;
            if (imagesLoaded === totalImages) {
              if (this.isStickerClicked || this.isStickerClickedCol) {
                loadAllStickers(() => {
                  const link = document.createElement("a");
                  link.download = "smile.png";
                  link.href = canvas.toDataURL("image/png");
                  link.click();
                });
              } else {
                const link = document.createElement("a");
                link.download = "smile.png";
                link.href = canvas.toDataURL("image/png");
                link.click();
              }
            }
          });
        });
      };

      drawImages();
    },

    stickerOn(value) {
      console.log(this.selectedOrientation); // Use 'this' to access the property

      if (value === "cat") {
        if (this.selectedOrientation === "flex-row") {
          this.isStickerClicked = true; // Toggle visibility
        } else {
          this.isStickerClickedCol = true; // Toggle visibility
        }
        this.activeSticker = "cat";
        this.imageFolder = "/catcouple"; // Set image folder to cat
      } else if (value === "dog") {
        this.activeSticker = "dog";
        if (this.selectedOrientation === "flex-row") {
          this.isStickerClicked = true; // Toggle visibility
        } else {
          this.isStickerClickedCol = true; // Toggle visibility
        }
        this.imageFolder = "/dog"; // Set image folder to dog
      } else if (value === "tulip") {
        this.activeSticker = "tulip";
        if (this.selectedOrientation === "flex-row") {
          this.isStickerClicked = true; // Toggle visibility
        } else {
          this.isStickerClickedCol = true; // Toggle visibility
        }
        this.imageFolder = "/tulip"; // Set image folder to tulip
      } else if (value === "berry") {
        this.activeSticker = "berry";
        if (this.selectedOrientation === "flex-row") {
          this.isStickerClicked = true; // Toggle visibility
        } else {
          this.isStickerClickedCol = true; // Toggle visibility
        }
        this.imageFolder = "/berry"; // Set image folder to berry
      }
    },

    removeSticker() {
      this.isStickerClicked = false; // Hide the images
      this.isStickerClickedCol = false; // Hide the images
      this.activeSticker = null; // Reset the active sticker
    },
  },
  mounted() {
    // Automatically start the camera when the component is mounted
    this.startCamera();
    this.startRecognition();
  },

  beforeDestroy() {
    // Ensure camera is stopped when the component is destroyed
    this.stopCamera();
    // Clear interval if it exists
    if (this.autoCaptureInterval) {
      clearInterval(this.autoCaptureInterval);
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  },
};
</script>

<template>
  <div class="flex-1 flex flex-col">
    <Modal ref="modalRef">
      <div class="rounded-xl shadow-xl w-full flex flex-col gap-4 items-center p-2">
        <div class="w-full flex justify-center p-1">
          <h2 class="text-2xl font-semibold text-zinc-900 dark:text-white ubuntu-bold">Preview</h2>
        </div>

        <div
          class="w-full flex flex-col md:flex-row md:justify-between items-center p-1 border-b border-gray-300"
        >
          <div class="md:w-1/3 w-full">
            <label class="ubuntu-bold text-sm md:text:md">Border:</label>
            <div class="p-2 gap-3 flex md:flex-wrap">
              <input
                type="button"
                :style="{ backgroundColor: '#f87171' }"
                class="h-5 w-5 shadow-md hover:scale-125 transition-all duration-300 rounded-full border-none cursor-pointer"
                @click="selectedColor = 'bg-red-400'"
              />
              <input
                type="button"
                :style="{ backgroundColor: '#60a5fa' }"
                class="h-5 w-5 shadow-md hover:scale-125 transition-all duration-300 rounded-full border-none cursor-pointer"
                @click="selectedColor = 'bg-blue-400'"
              />
              <input
                type="button"
                :style="{ backgroundColor: '#4ade80' }"
                class="h-5 w-5 shadow-md hover:scale-125 transition-all duration-300 rounded-full border-none cursor-pointer"
                @click="selectedColor = 'bg-green-400'"
              />
              <input
                type="button"
                :style="{ backgroundColor: '#fbbf24' }"
                class="h-5 w-5 shadow-md hover:scale-125 transition-all duration-300 rounded-full border-none cursor-pointer"
                @click="selectedColor = 'bg-yellow-400'"
              />
              <input
                type="button"
                :style="{ backgroundColor: '#9f7aea' }"
                class="h-5 w-5 shadow-md hover:scale-125 transition-all duration-300 rounded-full border-none cursor-pointer"
                @click="selectedColor = 'bg-purple-400'"
              />
              <input
                type="button"
                :style="{ backgroundColor: '#fb923c' }"
                class="h-5 w-5 shadow-md hover:scale-125 transition-all duration-300 rounded-full border-none cursor-pointer"
                @click="selectedColor = 'bg-orange-400'"
              />
              <input
                type="button"
                :style="{ backgroundColor: '#f472b6' }"
                class="h-5 w-5 shadow-md hover:scale-125 transition-all duration-300 rounded-full border-none cursor-pointer"
                @click="selectedColor = 'bg-pink-400'"
              />
              <input
                type="button"
                :style="{ backgroundColor: '#22d3ee' }"
                class="h-5 w-5 shadow-md hover:scale-125 transition-all duration-300 rounded-full border-none cursor-pointer"
                @click="selectedColor = 'bg-cyan-400'"
              />
              <input
                type="button"
                :style="{ backgroundColor: '#d946ef' }"
                class="h-5 w-5 shadow-md hover:scale-125 transition-all duration-300 rounded-full border-none cursor-pointer"
                @click="selectedColor = 'bg-fuchsia-400'"
              />
              <input
                type="button"
                :style="{ backgroundColor: '#f59e0b' }"
                class="h-5 w-5 shadow-md hover:scale-125 transition-all duration-300 rounded-full border-none cursor-pointer"
                @click="selectedColor = 'bg-amber-400'"
              />
            </div>
          </div>

          <!-- From Uiverse.io by Yaya12085 -->
          <div class="md:w-1/3 w-full">
            <label class="ubuntu-bold text-sm md:text:md">Orientation:</label>

            <div class="radio-inputs">
              <label class="radio">
                <input
                  type="radio"
                  name="radio"
                  value="flex-row"
                  v-model="selectedOrientation"
                  @change="removeSticker"
                />
                <span class="name ubuntu-regular">Landscape</span>
              </label>
              <label class="radio">
                <input
                  type="radio"
                  name="radio"
                  value="flex-col"
                  v-model="selectedOrientation"
                  @change="removeSticker"
                />
                <span class="name ubuntu-regular">Portrait</span>
              </label>
            </div>
          </div>
        </div>

        <div
          id="photostrip"
          :class="[
            'flex',
            selectedOrientation,
            'items-center',
            'gap-4',
            'p-4',
            'relative',
            selectedColor,
            selectedOrientation === 'flex-row' ? 'justify-center' : '',
            selectedOrientation === 'flex-col' ? 'max-h-80 overflow-y-auto' : '',
          ]"
        >
          <div v-if="isStickerClicked" class="z-20 absolute w-full h-full">
            <img :src="`${imageFolder}/cc1.png`" class="w-10 bottom-3 absolute left-0" alt="" />
            <img :src="`${imageFolder}/cc3.png`" class="w-10 top-20 absolute right-0" alt="" />
            <img :src="`${imageFolder}/cc4.png`" class="w-10 top-0 absolute left-60" alt="" />
            <img :src="`${imageFolder}/cc2.png`" class="w-10 bottom-0 absolute right-72" alt="" />
            <img :src="`${imageFolder}/cc5.png`" class="w-10 top-0 absolute left-20" alt="" />
            <img :src="`${imageFolder}/cc6.png`" class="w-10 top-0 absolute right-40" alt="" />
          </div>
          <div v-if="isStickerClickedCol" class="z-20 absolute w-full">
            <img :src="`${imageFolder}/cc1.png`" class="w-10 top-[60rem] absolute left-0" alt="" />
            <img
              :src="`${imageFolder}/cc3.png`"
              class="w-10 -bottom-[100%] absolute right-0"
              alt=""
            />
            <img :src="`${imageFolder}/cc4.png`" class="w-10 top-96 absolute right-5" alt="" />
            <img :src="`${imageFolder}/cc2.png`" class="w-10 -bottom-40 absolute right-72" alt="" />
            <img :src="`${imageFolder}/cc5.png`" class="w-10 top-0 absolute left-0" alt="" />
            <img :src="`${imageFolder}/cc6.png`" class="w-10 top-0 absolute right-10" alt="" />
          </div>
          <div
            v-for="index in numberOfResults"
            :key="index"
            class="w-3/4 h-1/3 bg-white shadow-xl rounded-xl"
          >
            <img
              v-if="capturedImages[index - 1]"
              :src="capturedImages[index - 1]"
              alt="Captured Snapshot"
              class="w-full h-auto object-cover"
              :style="{
                filter: selectedFilter,
                maxHeight: selectedOrientation === 'flex-col' ? 'auto' : '250px',
                maxWidth: selectedOrientation === 'flex-row' ? 'auto' : '100%',
              }"
            />
          </div>
        </div>
        <div class="w-full justify-between flex items-center">
          <!-- <div class="flex justify-center">
            <div class="">
              <button @click="toggleDropdown" class="px-4 py-1 bg-orange-900 text-white rounded">
                Stickers
              </button>
              <div v-show="isDropdownVisible" class="mt-2 absolute z-50">
                <ul class="bg-white border rounded shadow-md flex">
                  <li class="px-4 py-2" @click="stickerOn('cat')">
                    <img
                      src="/public/catcouple/cc1.png"
                      class="w-12 hover:scale-105 transition-all duration-300 cursor-pointer hover:bg-orange-200 rounded-full p-1"
                      :class="{ 'bg-orange-200': activeSticker === 'cat' }"
                      alt=""
                    />
                  </li>
                  <li class="px-4 py-2" @click="stickerOn('dog')">
                    <img
                      src="/public/dog/cc1.png"
                      class="w-12 hover:scale-105 transition-all duration-300 cursor-pointer hover:bg-orange-200 rounded-full p-1"
                      alt=""
                      :class="{ 'bg-orange-200': activeSticker === 'dog' }"
                    />
                  </li>
                  <li class="px-4 py-2" @click="stickerOn('tulip')">
                    <img
                      src="/public/tulip/cc1.png"
                      class="w-12 hover:scale-105 transition-all duration-300 cursor-pointer hover:bg-orange-200 rounded-full p-1"
                      alt=""
                      :class="{ 'bg-orange-200': activeSticker === 'tulip' }"
                    />
                  </li>
                  <li class="px-4 py-2" @click="stickerOn('berry')">
                    <img
                      src="/public/berry/cc1.png"
                      class="w-12 hover:scale-105 transition-all duration-300 cursor-pointer hover:bg-orange-200 rounded-full p-1"
                      alt=""
                      :class="{ 'bg-orange-200': activeSticker === 'berry' }"
                    />
                  </li>
                  <li class="px-4 py-2 flex items-center" @click="removeSticker">
                    <font-awesome-icon
                      icon="fa-solid fa-ban"
                      class="p-2 hover:scale-105 transition-all duration-300 cursor-pointer hover:bg-orange-200 rounded-full"
                      :class="{ 'bg-orange-200': !isStickerClicked && !isStickerClickedCol }"
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div> -->
          <button
            @click="downloadCollage"
            class="bg-orange-900 p-2 text-white ubuntu-bold rounded-xl shadow-xl cursor-pointer"
          >
            Download
          </button>
        </div>
      </div>
    </Modal>

    <div class="flex flex-col md:flex-row md:gap-10 p-2 items-center">
      <div
        class="flex flex-col items-center md:max-h-3/4 w-full md:w-1/4 gap-5 md:overflow-y-auto shadow-xl rounded-xl p-2"
      >
        <h2 class="text-xl md:text-3xl ubuntu-bold">Shots</h2>
        <div class="w-full overflow-x-auto flex flex-row md:flex-col items-center gap-2 p-2">
          <div
            @click="setNumberOfResults(1)"
            class="border-2 w-1/4 h-3/4 border-orange-700 hover:bg-orange-200 bg-white md:max-h-1/4 md:w-1/2 rounded-xl flex items-center md:justify-between shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer flex-col md:gap-10 p-2 pb-4"
          >
            <div class="w-full flex gap-2">
              <div class="h-3 w-3 bg-orange-300 rounded-full"></div>
              <div class="h-3 w-3 bg-orange-500 rounded-full"></div>
              <div class="h-3 w-3 bg-orange-700 rounded-full"></div>
            </div>
            <h2 class="text-2xl md:text-4xl ubuntu-bold flex-1">1</h2>
          </div>
          <div
            @click="setNumberOfResults(2)"
            class="border-2 w-1/4 h-3/4 border-orange-700 hover:bg-orange-200 bg-white md:h-1/4 md:w-1/2 rounded-xl flex items-center justify-between shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer flex-col md:gap-10 p-2 pb-4"
          >
            <div class="w-full flex gap-2">
              <div class="h-3 w-3 bg-orange-300 rounded-full"></div>
              <div class="h-3 w-3 bg-orange-500 rounded-full"></div>
              <div class="h-3 w-3 bg-orange-700 rounded-full"></div>
            </div>
            <h2 class="text-2xl md:text-4xl ubuntu-bold flex-1">2</h2>
          </div>
          <div
            @click="setNumberOfResults(3)"
            class="border-2 w-1/4 h-3/4 border-orange-700 hover:bg-orange-200 bg-white md:h-1/4 md:w-1/2 rounded-xl flex items-center md:justify-between shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer flex-col md:gap-10 p-2 pb-4"
          >
            <div class="w-full flex gap-2">
              <div class="h-3 w-3 bg-orange-300 rounded-full"></div>
              <div class="h-3 w-3 bg-orange-500 rounded-full"></div>
              <div class="h-3 w-3 bg-orange-700 rounded-full"></div>
            </div>
            <h2 class="text-2xl md:text-4xl ubuntu-bold flex-1">3</h2>
          </div>
          <div
            @click="setNumberOfResults(4)"
            class="bg-white w-1/4 h-3/4 md:h-1/4 md:w-1/2 rounded-xl flex items-center md:justify-between shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer flex-col md:gap-10 p-2 border-2 border-orange-700 hover:bg-orange-200 pb-4"
          >
            <div class="w-full flex gap-2">
              <div class="h-3 w-3 bg-orange-300 rounded-full"></div>
              <div class="h-3 w-3 bg-orange-500 rounded-full"></div>
              <div class="h-3 w-3 bg-orange-700 rounded-full"></div>
            </div>
            <h2 class="text-2xl md:text-4xl ubuntu-bold flex-1">4</h2>
          </div>
          <div
            @click="setNumberOfResults(5)"
            class="bg-white w-1/4 h-3/4 md:h-1/4 md:w-1/2 rounded-xl flex items-center md:justify-between shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer flex-col md:gap-10 p-2 border-2 border-orange-700 hover:bg-orange-200 pb-4"
          >
            <div class="w-full flex gap-2">
              <div class="h-3 w-3 bg-orange-300 rounded-full"></div>
              <div class="h-3 w-3 bg-orange-500 rounded-full"></div>
              <div class="h-3 w-3 bg-orange-700 rounded-full"></div>
            </div>
            <h2 class="text-2xl md:text-4xl ubuntu-bold flex-1">5</h2>
          </div>
        </div>
      </div>
      <div
        class="w-full md:w-1/2 rounded-xl md:shadow-xl flex justify-center flex-col items-center p-2"
      >
        <h2 class="text-xl md:text-3xl ubuntu-bold">Camera</h2>
        <div class="flex flex-col gap-2">
          <!-- <button @click="stopCamera">Stop Camera</button> -->
          <div class="p-2 gap-3 flex items-center">
            <button
              class="h-7 w-7 shadow-md hover:scale-125 bg-orange-300 transition-all duration-300 rounded-full border-none cursor-pointer"
              @click="selectedFilter = 'none'"
            >
              <!-- Font Awesome Icon -->
              <font-awesome-icon icon="fa-solid fa-ban" />
            </button>
            <button
              class="h-7 w-7 shadow-md hover:scale-125 bg-orange-300 transition-all duration-300 rounded-full border-none cursor-pointer"
              @click="selectedFilter = 'grayscale(100%) brightness(100%) blur(0.5px)'"
            >
              <!-- Font Awesome Icon -->
              <font-awesome-icon icon="fa-solid fa-circle-half-stroke" />
            </button>
            <button
              class="h-7 w-7 shadow-md hover:scale-125 bg-orange-300 transition-all duration-300 rounded-full border-none cursor-pointer"
              @click="
                selectedFilter =
                  'sepia(80%)  brightness(100%) contrast(100%) saturate(70%) blur(1px)'
              "
            >
              <!-- Font Awesome Icon -->
              <font-awesome-icon icon="fa-solid fa-camera-retro" />
            </button>
            <button
              class="h-7 w-7 shadow-md hover:scale-125 bg-orange-300 transition-all duration-300 rounded-full border-none cursor-pointer"
              @click="selectedFilter = 'blur(3px) brightness(100%)'"
            >
              <!-- Font Awesome Icon -->
              <font-awesome-icon icon="fa-solid fa-droplet" />
            </button>
            <button
              class="h-7 w-7 shadow-md hover:scale-125 bg-orange-300 transition-all duration-300 rounded-full border-none cursor-pointer"
              @click="selectedFilter = 'brightness(200%)'"
            >
              <font-awesome-icon icon="fa-solid fa-sun" />
            </button>
            <button
              class="h-7 w-7 shadow-md hover:scale-125 bg-orange-300 transition-all duration-300 rounded-full border-none cursor-pointer"
              @click="
                selectedFilter =
                  'blur(1px) saturate(100%) contrast(70%) brightness(100%) hue-rotate(10deg) '
              "
            >
              <font-awesome-icon icon="fa-solid fa-film" />
            </button>
            <button
              class="h-7 w-7 shadow-md hover:scale-125 bg-orange-300 transition-all duration-300 rounded-full border-none cursor-pointer"
              @click="selectedFilter = 'invert(100%)'"
            >
              <font-awesome-icon icon="fa-solid fa-arrows-to-eye" />
            </button>
            <button
              class="h-7 w-7 shadow-md hover:scale-125 bg-orange-300 transition-all duration-300 rounded-full border-none cursor-pointer"
              @click="selectedFilter = 'saturate(120%) brightness(150%)'"
            >
              <font-awesome-icon icon="fa-solid fa-leaf" />
            </button>
            <button
              class="h-7 w-7 shadow-md hover:scale-125 bg-orange-300 transition-all duration-300 rounded-full border-none cursor-pointer"
              @click="
                selectedFilter =
                  ' hue-rotate(160deg) sepia(75%) contrast(130%) saturate(280%) hue-rotate(180deg)'
              "
            >
              <font-awesome-icon icon="fa-solid fa-snowflake" />
            </button>
            <button
              class="h-7 w-7 shadow-md hover:scale-125 bg-orange-300 transition-all duration-300 rounded-full border-none cursor-pointer"
              @click="
                selectedFilter =
                  'sepia(50%) contrast(150%) saturate(200%) brightness(100%) hue-rotate(-15deg)'
              "
            >
              <font-awesome-icon icon="fa-solid fa-fire" />
            </button>
          </div>
          <div
            class="flex flex-col justify-center md:w-full relative items-center bg-orange-900 p-2"
          >
            <video
              class="rounded-md shadow-xl"
              ref="video"
              autoplay
              playsinline
              width="100%"
              muted
              :style="{ filter: selectedFilter }"
            ></video>
            <div
              v-if="timerActive"
              class="absolute flex items-center justify-center inset-0 bg-black/50"
            >
              <p class="text-white text-6xl font-semibold">
                <span
                  class="bg-white/10 p-10 ubuntu-bold rounded-full w-80 h-80 flex items-center justify-center text-white flash"
                >
                  <span
                    class="bg-white/30 p-10 ubuntu-bold rounded-full w-60 h-60 flex items-center justify-center text-white flash"
                  >
                    <span
                      class="bg-white/40 p-10 ubuntu-bold rounded-full w-40 h-40 flex items-center justify-center text-white flash"
                    >
                      {{ countdown }}
                    </span>
                  </span>
                </span>
              </p>
            </div>
            <div
              v-if="processedImage"
              class="absolute flex items-center justify-center inset-0 bg-black/90"
            >
              <p class="text-white text-4xl font-semibold ubuntu-bold">Please wait...</p>
            </div>
            <!-- <img src="/public/Smile.png" class="w-20 absolute bottom-14 left-2" /> -->
            <button @click="startAutoCapture(numberOfResults)" class="button">
              <font-awesome-icon icon="fa-solid fa-camera" class="text-xl text-white" />
            </button>
          </div>
        </div>
      </div>
      <div class="w-full md:w-1/4 h-3/4 p-5 flex flex-col items-center">
        <h2 class="text-xl md:text-3xl ubuntu-bold">Display</h2>
        <div
          class="overflow-x-auto md:overflow-y-auto h-full border-2 border-orange-500 bg-orange-300 w-full rounded-xl shadow-xl flex md:flex-col gap-2 items-center p-2 flex-row"
        >
          <div
            v-for="index in numberOfResults"
            :key="index"
            class="md:w-3/4 w-20 md:p-0 p-4 h-full md:h-1/3 mx-auto bg-white shadow-xl rounded-xl gap-2"
          >
            <!-- f -->
            <img
              v-if="capturedImages[index - 1]"
              :src="capturedImages[index - 1]"
              alt="Captured Snapshot"
              class="w-full h-full object-cover"
              :style="{ filter: selectedFilter }"
            />
            <!-- You can also show the index or any other content if you like -->
          </div>
        </div>
        <button
          @click="openModal"
          class="button p-2 w-20 text-white ubuntu-bold rounded-xl shadow-xl cursor-pointer"
        >
          View
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
img {
  max-width: 100%;
  height: auto;
  object-fit: contain; /* Ensures the image fits within its container without stretching */
}
video {
  border: 1px solid #ccc;
  max-width: 100%;
  display: block;
}
button {
  margin-top: 10px;
}
select {
  margin-top: 10px;
}

/* From Uiverse.io by satyamchaudharydev */
/* inspired from this svgbackgrounds.com/ */
.button {
  width: fit-content;
  display: flex;
  padding: 0.8em 1.1em;
  gap: 0.4rem;
  border: none;
  font-weight: bold;
  border-radius: 30px;
  cursor: pointer;
  text-shadow: 2px 2px 3px rgb(136 0 136 / 50%);
  background: linear-gradient(
      15deg,
      #521504,
      #953c05,
      #bc5709,
      #de6f3d,
      #f09f33,
      #de6f3d,
      #bc5709,
      #953c05,
      #521504
    )
    no-repeat;
  background-size: 300%;
  background-position: left center;
  transition: background 0.3s ease;
  color: #fff;
}

.button:hover {
  background-size: 320%;
  background-position: right center;
}

.button:hover svg {
  fill: #fff;
}

.button svg {
  width: 23px;
  fill: #f09f33;
  transition: 0.3s ease;
}

/* From Uiverse.io by Yaya12085 */
.radio-inputs {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  border-radius: 0.5rem;
  background-color: #ffeed0;
  box-sizing: border-box;
  box-shadow: 0 0 0px 1px rgba(0, 0, 0, 0.06);
  padding: 0.25rem;
  width: 200px;
  font-size: 14px;
}

.radio-inputs .radio {
  flex: 1 1 auto;
  text-align: center;
}

.radio-inputs .radio input {
  display: none;
}

.radio-inputs .radio .name {
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: none;
  padding: 0.5rem 0;
  color: rgba(51, 65, 85, 1);
  transition: all 0.15s ease-in-out;
}

.radio-inputs .radio input:checked + .name {
  background-color: #fff;
  font-weight: 600;
}
@keyframes flash {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.flash {
  animation: flash 1s infinite;
}
</style>
