const mongoose = require('mongoose');
const Product = require('../models/product'); //스키마 가져오기
const { products, places } = require('./seedHelpers') //하드코딩된 시드 가져오기

// db 연결
mongoose.connect('mongodb://localhost:27017/cheek-market') //몽구스 연결
    .then(() => {
        console.log("Mongo connection open!")
    })
    .catch(err => {
        console.log("oh no mongo connection error!!")
        console.log(err);
    })

const sample = array => array[Math.floor(Math.random() * array.length)]; //랜덤 배열

const seedDb = async () => { //랜덤하게 50개의 제품 및 위치 배정하는 함수
    await Product.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const rndPrice = Math.floor(Math.random() * 100) * 100 + 500;// 랜덤한 가격변수
        const prod = new Product({
            author: '66d5e2018683632c62efebd7',
            title: `${sample(products)}`,
            location: `${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit Illo iure blanditiis rem nulla assumenda aperiam similique nostrum tempore dolore sequi suscipit provident reiciendis quasi doloremque sit id ut temporibus corrupti',
            price: rndPrice,
            images: [
                {
                    url: 'https://res.cloudinary.com/dp8tgre1c/image/upload/v1726732108/Cheek-Market/tdbhejrupl8zulmti2cy.jpg',
                    filename: 'Cheek-Market/tdbhejrupl8zulmti2cy',
                }
            ]
        })
        await prod.save();
    }
}

seedDb().then(() => {  //seedDb함수 실행후 몽구스 연결창 닫기
    mongoose.connection.close();
})