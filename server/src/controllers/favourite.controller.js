import responseHandler from "../handlers/response.handler.js";
import favoriteModel from "../models/favourite.model.js";

const addFavorite = async (res, req) => {
    try {
        const isfavorite = await favoriteModel.findOne({
            user: req.user.id,
            mediaId: req.body.mediaId
        });

        if (isfavorite) return responseHandler.ok(res, isfavorite);

        const favorite = new favoriteModel({
            ...req.body,
            user: req.user.id
        });

        await favorite.save();

        responseHandler.ok(res, favorite);
    } catch {
        responseHandler.error(res);
    }
};

const removeFavorite = async (res, req) => {
    try {
        const { favoriteId } = req.parms;

        const favorite = await favoriteModel.findOne({
            user: req.user.id,
            _Id: favoriteId
        });

        if (!favorite) return responseHandler.notfound(res);

        await favorite.remove();
        responseHandler.ok(res);
    } catch {
        responseHandler.error(res);
    }

}

const getFavoritesOfUser = async (req, res) => {
    try {
        const favorite = await favoriteModel.find({ user: req.user.id }).sort("-createdAt");
        responseHandler.ok(res, favorite);
    } catch{
        responseHandler.error(res);
    }
} 

export default { addFavorite, removeFavorite, getFavoritesOfUser };