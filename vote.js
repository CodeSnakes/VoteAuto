const puppeteer = require('puppeteer');
const schedule = require("node-schedule");

async function vote() {
    const browser = await puppeteer.launch({
        headless: false, // 是否运行浏览器无头模式(boolean)
        timeout: 5000, // 设置超时时间(number)，若此值为0，则禁用超时
        defaultViewport: { width: 800, height: 800 }, //设置打开页面在浏览器中的宽高
        slowMo: 500, //设置每个步骤放慢秒 给予页面足够的缓存时间
        ignoreDefaultArgs: ['--enable-automation'] //去掉提示
    });

    let page = await browser.newPage();
    // -----异步配置-------
    async function setBrowserPage(page) {
        // 设置user_agent
        console.log('------Asynchronous configuration------');
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4181.9 Safari/537.36")
            // 设置webdriver
        await page.evaluateOnNewDocument(() => {
            console.log('------异步配置2------');
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            Object.defineProperty(navigator, 'plugins', {
                get: () => [{
                        0: { type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format", enabledPlugin: Plugin },
                        description: "Portable Document Format",
                        filename: "internal-pdf-viewer",
                        length: 1,
                        name: "Chrome PDF Plugin"
                    },
                    {
                        0: { type: "application/pdf", suffixes: "pdf", description: "", enabledPlugin: Plugin },
                        description: "",
                        filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
                        length: 1,
                        name: "Chrome PDF Viewer"
                    },
                    {
                        0: { type: "application/x-nacl", suffixes: "", description: "Native Client Executable", enabledPlugin: Plugin },
                        1: { type: "application/x-pnacl", suffixes: "", description: "Portable Native Client Executable", enabledPlugin: Plugin },
                        description: "",
                        filename: "internal-nacl-plugin",
                        length: 2,
                        name: "Native Client"
                    }
                ],
            });
        });
        await page.evaluateOnNewDocument(() => {
            window.navigator.chrome = {
                runtime: {},
                loadTimes: function() {},
                csi: function() {},
                app: {}
            };
        });
        await page.evaluateOnNewDocument(() => {
            window.navigator.language = {
                runtime: {},
                loadTimes: function() {},
                csi: function() {},
                app: {}
            };
        });
        return true;
    }
    async function toPage() {
        console.log("------Go to the voting home page------");
        await page.goto('http://gongyi.hnedu.cn/zpzs/dhl/2871531.shtml#anchor'); //投票网站
        page.waitForTimeout(2000)
            .then(() => console.log('------Waited a 2000! To get dom------'));
        const linkforVote = await page.$('body > div.contents > div.gmbs > div > div.gcontent_cont > div:nth-child(4) > a > img');
        //投票按钮对应选择器元素
        try {
            await linkforVote.click();
            // await page.waitFor(500);
            await page.waitForTimeout(500)
                .then(() => console.log('------Waited a 500! To get dom------'));
        } catch (error) {
            console.log(error);
            await browser.close();
        }
        const linkforsubmit = await page.$('#z-dialog-1-cancelButton'); //确认按钮选择器元素
        try {
            await linkforsubmit.click();
            await page.waitForTimeout(500).then(() => console.log('------Waited a 500! To get dom------'));
            await browser.close();
            console.log('------vote over------');
        } catch (error) {
            console.log(error);
            await browser.close();
        }
    };
    // ------------
    setBrowserPage(page).then(result => { //无头浏览器配置完成后调用
        console.log('------Browser configuration complete------' + result);
        toPage();
    });
};
var flag = 1;
// 每分钟的35秒时都会执行一次投票流程
function scheduleCronstyle() {
    schedule.scheduleJob('35 * * * * *', function() {
        var times = Date();
        console.log('-----第' + flag + '次投票-------');
        console.log("-----StartTime:" + times + "-----");
        vote();
        flag++;
    });
}
scheduleCronstyle();