'use strict';

// ===== كود الكيكة ثلاثية الأبعاد =====
let scene, camera, renderer, cake, candles = [], candleLights = [];
let cakeClicked = false;
let scrollEnabled = false;

function initCake() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("cake-canvas").appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const cakeGroup = new THREE.Group();

    const bottomCake = new THREE.Mesh(
        new THREE.CylinderGeometry(5, 5, 2, 32),
        new THREE.MeshPhongMaterial({ color: 0xffb6c1 })
    );
    cakeGroup.add(bottomCake);

    const middleCake = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 4, 2, 32),
        new THREE.MeshPhongMaterial({ color: 0xffc0cb })
    );
    middleCake.position.y = 2;
    cakeGroup.add(middleCake);

    const topCake = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3, 2, 32),
        new THREE.MeshPhongMaterial({ color: 0xffcccb })
    );
    topCake.position.y = 4;
    cakeGroup.add(topCake);

    addFrosting(cakeGroup);
    addCandles(cakeGroup);

    scene.add(cakeGroup);
    cake = cakeGroup;

    camera.position.z = 15;
    camera.position.y = 5;

    animate();

    renderer.domElement.addEventListener("click", handleCakeClick);
}

function addFrosting(cakeGroup) {
    const layers = [
        { count: 12, radius: 5, y: 0.8, size: 0.5 },
        { count: 10, radius: 4, y: 2.8, size: 0.4 },
        { count: 8,  radius: 3, y: 4.8, size: 0.3 }
    ];
    layers.forEach(({ count, radius, y, size }) => {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const mesh = new THREE.Mesh(
                new THREE.SphereGeometry(size, 8, 8),
                new THREE.MeshPhongMaterial({ color: 0xffffff })
            );
            mesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
            cakeGroup.add(mesh);
        }
    });
}

function addCandles(cakeGroup) {
    const positions = [
        { x: 0, y: 5.5, z: 0 },
        { x: 1.5, y: 5.5, z: 0 },
        { x: -1.5, y: 5.5, z: 0 },
        { x: 0, y: 5.5, z: 1.5 },
        { x: 0, y: 5.5, z: -1.5 }
    ];

    positions.forEach((pos) => {
        const candle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 1, 16),
            new THREE.MeshPhongMaterial({ color: 0xf5deb3 })
        );
        candle.position.set(pos.x, pos.y, pos.z);
        cakeGroup.add(candle);
        candles.push(candle);

        const candleLight = new THREE.PointLight(0xffcc00, 1, 3);
        candleLight.position.set(pos.x, pos.y + 0.7, pos.z);
        cakeGroup.add(candleLight);
        candleLights.push(candleLight);

        const flame = new THREE.Mesh(
            new THREE.ConeGeometry(0.15, 0.4, 16),
            new THREE.MeshPhongMaterial({ color: 0xff9900, emissive: 0xff6600, transparent: true, opacity: 0.9 })
        );
        flame.position.set(pos.x, pos.y + 0.7, pos.z);
        cakeGroup.add(flame);
        candles.push(flame);
    });
}

function animate() {
    requestAnimationFrame(animate);
    candles.forEach((obj, index) => {
        if (index % 2 === 1 && !cakeClicked) {
            obj.rotation.y += 0.05;
            obj.position.y += Math.sin(Date.now() * 0.01) * 0.001;
        }
    });
    if (cakeClicked) {
        cake.rotation.y += 0.03;
    }
    renderer.render(scene, camera);
}

function handleCakeClick() {
    if (!cakeClicked) {
        cakeClicked = true;

        // 🎵 تشغيل الصوت
        const sound = document.getElementById("birthday-sound");
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Audio error:", e));
        }

        // 🎆 تشغيل الألعاب النارية
        startFireworks();

        document.getElementById("instructions").style.display = "none";

        // إطفاء الشموع
        candles.forEach((obj, index) => {
            if (index % 2 === 1) obj.visible = false;
        });
        candleLights.forEach(light => light.intensity = 0);

        // كونفيتي
        document.getElementById("confetti-canvas").style.display = "block";
        createConfetti();

        scrollEnabled = true;
        setTimeout(() => {
            document.getElementById("scroll-instruction").style.display = "block";
        }, 1000);
    }
}

// ===== تشغيل الألعاب النارية =====
function startFireworks() {
    // إظهار كانفاس الألعاب النارية
    const stageContainer = document.querySelector('.stage-container');
    if (stageContainer) {
        stageContainer.classList.remove('remove');
    }
    // تشغيل الألعاب النارية (رفع البوز)
    if (typeof togglePause === 'function') {
        togglePause(false);
    }
    // تفعيل Auto Launch
    if (typeof store !== 'undefined') {
        store.setState({
            paused: false,
            config: Object.assign({}, store.state.config, { autoLaunch: true })
        });
    }
}

// ===== كونفيتي =====
function createConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiColors = ["#ff4081","#ff9e80","#ffff8d","#b9f6ca","#80d8ff","#8c9eff","#ea80fc"];
    const confetti = [];

    for (let i = 0; i < 200; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 2 - canvas.height,
            size: Math.random() * 5 + 5,
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            speed: Math.random() * 3 + 2,
            rotation: 0,
            rotationSpeed: Math.random() * 10 - 5
        });
    }

    function drawConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let stillActive = false;
        confetti.forEach(c => {
            if (c.y < canvas.height) {
                stillActive = true;
                ctx.save();
                ctx.translate(c.x, c.y);
                ctx.rotate((c.rotation * Math.PI) / 180);
                ctx.fillStyle = c.color;
                ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
                ctx.restore();
                c.y += c.speed;
                c.rotation += c.rotationSpeed;
            }
        });
        if (stillActive) requestAnimationFrame(drawConfetti);
        else canvas.style.display = "none";
    }

    drawConfetti();
}

// ===== Resize =====
window.addEventListener("resize", () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// ===== Scroll =====
window.addEventListener("scroll", function () {
    if (!scrollEnabled) { window.scrollTo(0, 0); return; }
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    if (scrollPosition > 100) {
        document.getElementById("cake-canvas").style.transform = "translate(-40%, 0) scale(0.5)";
        document.getElementById("letter").style.right = "10%";
        document.getElementById("scroll-instruction").style.display = "none";
    } else {
        document.getElementById("cake-canvas").style.transform = "translate(0, 0) scale(1)";
        document.getElementById("letter").style.right = "-100%";
        if (cakeClicked) document.getElementById("scroll-instruction").style.display = "block";
    }
});

// ===== Init =====
window.onload = function () {
    initCake();
};
