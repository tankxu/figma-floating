function main() {
    let floatData;
    switch (figma.command) {
        case "float":
            if (figma.currentPage.selection.length !== 1) {
                figma.closePlugin("⚠️ Please select only one layer.");
                return;
            }
            let selection = figma.currentPage.selection[0];
            let selectionWidth;
            let selectionHeight;
            try {
                selectionWidth = Math.round(selection.absoluteRenderBounds.width);
                selectionHeight = Math.round(selection.absoluteRenderBounds.height);
            }
            catch (error) {
                // console.error(error);
                try {
                    selectionWidth = Math.round(selection.width);
                    selectionHeight = Math.round(selection.height);
                }
                catch (error) {
                    // console.error(error);
                    figma.closePlugin("Sorry, the selected layer is not supported.");
                }
            }
            console.log(selectionWidth, selectionHeight);
            selection
                .exportAsync({ constraint: { type: "SCALE", value: 2 }, format: "PNG" })
                .then((bytes) => {
                // console.log(bytes);
                figma.showUI(__html__, {
                    width: selectionWidth,
                    height: selectionHeight,
                });
                floatData = {
                    image: bytes,
                    width: selectionWidth,
                    height: selectionHeight,
                };
                figma.ui.postMessage(floatData);
                figma.clientStorage
                    .setAsync("previousFloat", floatData)
                    .catch((err) => { });
                console.log("Float data saved");
            });
            break;
        case "previous":
            figma.clientStorage
                .getAsync("previousFloat")
                .then((data) => {
                floatData = data;
                if (floatData.image && floatData.width && floatData.height) {
                    figma.showUI(__html__, {
                        width: floatData.width,
                        height: floatData.height,
                    });
                    figma.ui.postMessage({
                        image: floatData.image,
                        width: floatData.width,
                        height: floatData.height,
                    });
                }
            })
                .catch((err) => {
                console.log("No previous found");
            });
    }
    figma.ui.onmessage = (msg) => {
        switch (msg.type) {
            case "resize":
                figma.ui.resize(msg.size.w, msg.size.h);
                break;
        }
    };
    figma.on("drop", (event) => {
        const newNode = figma.createRectangle();
        newNode.fills = [
            {
                imageHash: figma.createImage(floatData.image).hash,
                type: "IMAGE",
                scaleMode: "FILL",
            },
        ];
        // newNode.x = event.absoluteX - floatData.width / 2;
        // newNode.y = event.absoluteY + floatData.height / 2;
        newNode.x = event.absoluteX;
        newNode.y = event.absoluteY;
        console.log("node ", newNode.x, newNode.y);
        newNode.resize(floatData.width, floatData.height);
        figma.currentPage.selection = [newNode];
        return false;
    });
}
main();
