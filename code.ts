function main() {
  if (figma.currentPage.selection.length !== 1) {
    figma.closePlugin("⚠️ Please select only one layer.");
    return;
  }

  let selection: any = figma.currentPage.selection[0];

  let selectionWidth;
  let selectionHeight;

  try {
    selectionWidth = Math.round(selection.absoluteRenderBounds.width);
    selectionHeight = Math.round(selection.absoluteRenderBounds.height);
  } catch (error) {
    // console.error(error);
    selectionWidth = Math.round(selection.width);
    selectionHeight = Math.round(selection.height);
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

      figma.ui.postMessage({
        image: bytes,
        width: selectionWidth,
        height: selectionHeight,
      });
    });

  figma.ui.onmessage = (msg) => {
    switch (msg.type) {
      case "resize":
        figma.ui.resize(msg.size.w, msg.size.h);
        break;
    }
  };
}

main();
