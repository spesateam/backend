import axios from "axios";
import * as util from "util";

export const toSnakeCase = (someString: string) => {
    const match = someString
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g);
    if (match)
        return match
            .map(x => x.toLowerCase())
            .join("_");
    else return null;
};

export const getCitySlug = async (placeId: string) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?language=en&place_id=${placeId}&key=AIzaSyBBPzPNuYM7Qws4N1JvEGIRgZCa8xvuJNo`;
    const response = await axios.get(url);
    const cityArr = response.data.results[0].address_components.filter((item: any) => item.types.includes("locality"));
    const city = toSnakeCase(cityArr[0].short_name);
    console.log(util.inspect(response.data.results, true, 20, true));
    console.log(city);
    return city;
};

// getCitySlug("ChIJPXupDrb8hkcRm8JyxGbdVmU");
