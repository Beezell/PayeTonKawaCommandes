const jwt = require('jsonwebtoken');

const authorized = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token d\'authentification manquant'
            });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Format de token invalide'
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({
                        success: false,
                        message: 'Token expiré'
                    });
                }
                return res.status(403).json({
                    success: false,
                    message: 'Token invalide'
                });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'authentification'
        });
    }
};

module.exports = authorized;
