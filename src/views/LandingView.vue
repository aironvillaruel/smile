<script></script>

<template>
  <div id="landing" class="h-full flex justify-center items-center">
    <div class="w-1/2 flex justify-center flex-col items-center p-2 gap-5">
      <img src="/public/smile.png" class="slide-top" />

      <h2 class="text-5xl text-white ubuntu-regular text-focus-in">Where Every Snap Brings a Smile!</h2>
      <RouterLink
        to="/photo"
        class="bg-orange-900 text-white ubuntu-bold w-20 text-center rounded-xl shadow-xl hover:scale-105 transition-all duration-300 hover:bg-orange-700 p-2"
        >Photo</RouterLink
      >
    </div>
  </div>
</template>
<style>
#landing {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' width='1440' height='560' preserveAspectRatio='none' viewBox='0 0 1440 560'%3e%3cg mask='url(%26quot%3b%23SvgjsMask1010%26quot%3b)' fill='none'%3e%3crect width='1440' height='560' x='0' y='0' fill='rgba(69%2c 10%2c 10%2c 1)'%3e%3c/rect%3e%3cpath d='M1560 560L0 560 L0 347.99Q38.16 266.15%2c 120 304.31Q186.67 250.98%2c 240 317.65Q261.25 266.9%2c 312 288.16Q379.94 236.1%2c 432 304.04Q491.45 291.49%2c 504 350.94Q551.15 278.09%2c 624 325.24Q665.39 294.63%2c 696 336.03Q731.86 251.88%2c 816 287.74Q858.64 258.38%2c 888 301.03Q950.71 291.74%2c 960 354.45Q1031 305.45%2c 1080 376.45Q1112.97 289.42%2c 1200 322.39Q1252.98 255.37%2c 1320 308.34Q1392.26 260.6%2c 1440 332.86Q1477.46 250.32%2c 1560 287.78z' fill='rgba(146%2c 64%2c 14%2c 1)'%3e%3c/path%3e%3cpath d='M1536 560L0 560 L0 375.78Q55.98 311.76%2c 120 367.74Q204.42 332.16%2c 240 416.58Q243.02 347.6%2c 312 350.61Q377.91 296.52%2c 432 362.44Q507.24 365.68%2c 504 440.91Q537.61 402.51%2c 576 436.12Q618.11 358.23%2c 696 400.33Q741.63 373.95%2c 768 419.58Q776.74 356.32%2c 840 365.06Q910.81 315.87%2c 960 386.68Q1023.87 378.55%2c 1032 442.42Q1033.37 371.78%2c 1104 373.15Q1133.02 330.17%2c 1176 359.2Q1251.09 314.28%2c 1296 389.37Q1349.72 323.1%2c 1416 376.82Q1496.96 337.78%2c 1536 418.75z' fill='rgba(217%2c 119%2c 6%2c 1)'%3e%3c/path%3e%3cpath d='M1464 560L0 560 L0 452.85Q73.75 406.6%2c 120 480.35Q161.64 450%2c 192 491.64Q224.43 404.06%2c 312 436.49Q379.04 383.53%2c 432 450.58Q514.11 412.69%2c 552 494.79Q598.11 420.89%2c 672 467Q714.22 437.22%2c 744 479.44Q788.73 404.17%2c 864 448.9Q909.15 422.05%2c 936 467.2Q1011.9 423.11%2c 1056 499.01Q1064.47 435.48%2c 1128 443.94Q1199.11 395.05%2c 1248 466.16Q1278.25 424.42%2c 1320 454.67Q1346.13 408.8%2c 1392 434.93Q1452.45 423.38%2c 1464 483.83z' fill='rgba(251%2c 191%2c 36%2c 1)'%3e%3c/path%3e%3cpath d='M1464 560L0 560 L0 517.99Q29.03 475.02%2c 72 504.05Q126.42 486.47%2c 144 540.88Q198.29 523.17%2c 216 577.47Q269.98 511.45%2c 336 565.43Q360.77 518.2%2c 408 542.98Q430.52 493.5%2c 480 516.02Q569.79 485.81%2c 600 575.6Q665.08 520.68%2c 720 585.77Q732.78 526.55%2c 792 539.32Q865.61 492.93%2c 912 566.54Q929.1 511.63%2c 984 528.73Q1028.72 453.45%2c 1104 498.16Q1195.08 469.24%2c 1224 560.31Q1272.66 488.97%2c 1344 537.63Q1387.29 460.92%2c 1464 504.21z' fill='white'%3e%3c/path%3e%3c/g%3e%3cdefs%3e%3cmask id='SvgjsMask1010'%3e%3crect width='1440' height='560' fill='white'%3e%3c/rect%3e%3c/mask%3e%3c/defs%3e%3c/svg%3e");
  background-size: cover; /* Ensure background covers the div */
  background-position: center; /* Center the background */
  background-repeat: no-repeat; /* Avoid repeating the background */
}
</style>
