const screenshot = require('desktop-screenshot');
const sharp = require('sharp');
const path = require('path')
const getColors = require('get-image-colors')
const Tesseract = require('tesseract.js');
const axios = require('axios')
const puppeteer = require('puppeteer');

const IMG_FOLDER = "imgs/"
const FILE_NAME =  'screenshot.png'
const DARK_BLUE_COLOR = 0.2

const takeScreenshot =   () => {
    return  new Promise((resolve, reject) => {
        screenshot(IMG_FOLDER + FILE_NAME, function(error, complete) {
            if(error) {
                reject()
                console.log("Screenshot failed", error);
            } else {
                resolve()
                console.log("Screenshot succeeded");
            }

        });
    })
}

const extract = (image_url, output, type, extract) =>  {
    return new Promise((resolve, reject) => {
        sharp(IMG_FOLDER+image_url)
            .extract(extract)
            .toFile(`${IMG_FOLDER}${output}.${type}`, function(err) {
                if(err){
                    reject(err)
                }
               resolve()
            });

    })
}

const getColorsOfFIle =  (filePath) => {
    return new Promise((resolve, reject) => {
        getColors(path.join(__dirname, IMG_FOLDER + filePath ))
            .then(colors => {
            resolve(colors) })
            .catch(error => reject(error))
    })

}
const getLuminance = (colors) => {
    return colors.map(color => Math.round(color.luminance() * 100) / 100 )
}

const isThereOneGreaterThan = (number,array) => {
    return array.some( el => el > number )
}

const getText = (img) => {
    return new Promise((resolve, reject) => {
        Tesseract.recognize(
            IMG_FOLDER+ img,
            'eng',
            { logger: m => console.log(m) }
        ).then(({ data: { text } }) => {
            resolve(text)
        }).catch(error => reject(error))

    })
}


const gotoTelegram = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://web.telegram.org/#/im', {waitUntil: 'networkidle2'});

}

const api = {
    askQuestion : (sentence) => axios.post('http://127.0.0.1:8000/question', {sentence} )
}

const startApp = async () => {
    try {
        await takeScreenshot();
        await extract(FILE_NAME, 'telegram', 'jpg', { left: 2900, top: 100, width: 400, height: 800 })
        await extract('telegram.jpg', 'last_message','jpg',{ top: 700 , left: 0, width: 400, height: 100 })
        await extract('last_message.jpg', 'last_logo','jpg',{ top: 0 , left: 0, width: 50, height: 50 })
        const colors = await getColorsOfFIle('last_logo.jpg')
        const luminance = getLuminance(colors)
        const shouldSendMessage =  isThereOneGreaterThan(DARK_BLUE_COLOR, luminance)

        await extract('last_message.jpg', 'last_chat_text','jpg',{ top: 39 , left: 50, width: 250, height: 50 })

        const text = await getText('last_chat_text.jpg')
        const {data: bot_response} = await api.askQuestion(text)
        const answer = bot_response.answer;
        await gotoTelegram()
        console.log(answer)

       // console.log('NO_NEW_MESSAGE')
    } catch (e) {
        console.log(e)
    }

}



startApp()
