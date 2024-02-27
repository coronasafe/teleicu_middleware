import prisma from "@/lib/prisma";

export const getMonitorCoordinates = async (bedId: string) => {
  try {
    const preset = await prisma.preset.findFirst({
      where: {
        bed: { externalId: bedId },
      },
    });

    if (!preset) {
      console.log(`Preset for bed ${bedId} not found`);

      return {
        x: 0,
        y: 0,
        zoom: 0,
      };
    }

    return {
      x: preset.x,
      y: preset.y,
      zoom: preset.zoom,
    };
  } catch (err) {
    console.log(err);

    return {
      x: 0,
      y: 0,
      zoom: 0,
    };
  }
};
