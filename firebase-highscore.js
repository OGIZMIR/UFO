const CDN = "https:" + "//www.gstatic.com/firebasejs/13.1.0/";

async function startFirebaseTest() {
  try {
    const appSdk = await import(CDN + "firebase-app.js");
    const authSdk = await import(CDN + "firebase-auth.js");
    const dbSdk = await import(CDN + "firebase-database.js");

    const firebaseConfig = {
      apiKey: "AIzaSyCKT7YHlFGy90-3_sGoU-Qzys4VQrCuHIA",
      authDomain: "ufo-jagd.firebaseapp.com",
      databaseURL: "https:" + "//ufo-jagd-default-rtdb.firebaseio.com",
      projectId: "ufo-jagd",
      storageBucket: "ufo-jagd.firebasestorage.app",
      messagingSenderId: "49353986053",
      appId: "1:49353986053:web:c2ad012df612d722024c6c"
    };

    const app = appSdk.initializeApp(firebaseConfig);
    const auth = authSdk.getAuth(app);
    const db = dbSdk.getDatabase(app);

    window.ufoFirebase = {
      status: "VERBINDE",
      uid: null,
      app,
      auth,
      db
    };

    const credential = await authSdk.signInAnonymously(auth);

    window.ufoFirebase.status = "ONLINE";
    window.ufoFirebase.uid = credential.user.uid;

    console.log("UFO Firebase: ONLINE");
    console.log("Anonyme UID:", credential.user.uid);

  } catch (error) {
    window.ufoFirebase = {
      status: "FEHLER",
      error: String(error)
    };

    console.error("UFO Firebase Fehler:", error);
  }
}

startFirebaseTest();
