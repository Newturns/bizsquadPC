export const environment = {
    production: false,
    firebase: {
        apiKey: "AIzaSyCT8GgcwWfND7kmt3ZPLwSQ2YW1MDnfhEM",
        authDomain: "bizsquad-6d1be.firebaseapp.com",
        databaseURL: "https://bizsquad-6d1be.firebaseio.com",
        projectId: "bizsquad-6d1be",
        storageBucket: "bizsquad-6d1be.appspot.com",
        messagingSenderId: "83346353069"

        // change test DB?

        // apiKey: "AIzaSyAM4OlSUISkIm3JKZoU7M-a5SAcLp8TUFg",
        // authDomain: "bizsquad-test.firebaseapp.com",
        // databaseURL: "https://bizsquad-test.firebaseio.com",
        // projectId: "bizsquad-test",
        // storageBucket: "bizsquad-test.appspot.com",
        // messagingSenderId: "873460252341"
    },
    loading: {
        spinner: 'circles',
        showBackdrop: false,
    },
    //테스트용
    // bizServerUri: 'http://localhost:9010',
    // webJumpBaseUrl: 'http://localhost:4200/auth?token=',
    bizServerUri: 'https://manager.bizsquad.net:9010',
    webJumpBaseUrl: 'https://product.bizsquad.net/auth?token=',
    publicWeb : 'https://www.bizsquad.net/'

};
