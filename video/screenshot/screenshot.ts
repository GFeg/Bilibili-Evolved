let canvas: HTMLCanvasElement | null = null;
let context: CanvasRenderingContext2D | null = null;
class Screenshot
{
    blob: Blob;
    url: string;
    constructor(blob: Blob)
    {
        this.blob = blob;
        this.url = URL.createObjectURL(this.blob);
    }

    revoke()
    {
        URL.revokeObjectURL(this.url);
    }
}
export const takeScreenshot = (video: HTMLVideoElement) =>
{
    if (canvas === null || context === null)
    {
        canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context = canvas.getContext("2d");
    }
    return new Promise<Screenshot>((resolve, reject) =>
    {
        if (canvas === null || context === null)
        {
            reject("视频截图失败: canvas 未创建或创建失败.");
            return;
        }
        context.drawImage(video, 0, 0);
        canvas.toBlob(blob =>
        {
            if (blob === null)
            {
                reject("视频截图失败: 创建 blob 失败.");
                return;
            }
            resolve(new Screenshot(blob));
        }, "image/png");
    });
}
resources.applyStyle("videoScreenshotStyle");
document.body.insertAdjacentHTML("beforeend", /*html*/`
    <div class="video-screenshot-list">
        <video-screenshot v-for="screenshot of screenshots" v-bind:object-url="screenshot.url" v-bind:key="screenshot.url"></video-screenshot>
    </div>
`);
Vue.component("video-screenshot", {
    props: {
        objectUrl: String
    },
    template: /*html*/`
        <div class="video-screenshot-thumbnail">
            <img v-bind:src="objectUrl">
            <div class="mask">
                <button class="save"><i class="mdi mdi-content-save-outline"></button>
                <button class="discard"><i class="mdi mdi-delete-forever-outline"></button>
            </div>
        </div>`,
});
const screenShotsList = new Vue({
    el: ".video-screenshot-list",
    data: {
        screenshots: [] as Screenshot[],
    },
});
Observer.videoChange(async () =>
{
    const video = await SpinQuery.select("#bofqi video") as HTMLVideoElement;
    const time = await SpinQuery.select(".bilibili-player-video-time");
    if (video === null || time === null || document.querySelector(".video-take-screenshot"))
    {
        return;
    }
    time.insertAdjacentHTML("afterend", /*html*/`
    <div class="video-take-screenshot" title="截图">
        <span><i class="mdi mdi-camera"></i></span>
    </div>`);
    const screenshotButton = document.querySelector(".video-take-screenshot");
    if (screenshotButton === null)
    {
        return;
    }
    screenshotButton.addEventListener("click", async () =>
    {
        const screenshot = await takeScreenshot(video);
        screenShotsList.screenshots.push(screenshot);
    });
});
export default {
    export: {
        takeScreenshot,
        screenShotsList,
    },
};