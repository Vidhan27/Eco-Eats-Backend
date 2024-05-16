const middleware = {
    ensureLoggedIn: (req, res, next) => {
        try{
            if (req.isAuthenticated()) {
                return next();
            }
            res.status(401).json({ message: 'You need to login first' });
        }catch(err){
            console.log(err)
        }
    },

    ensureAgentLoggedIn: (req, res, next) => {
       try{
            if (req.isUnauthenticated()) {
            return res.status(401).json({ message: 'You need to login first' });
        }
        if (!req.user || req.user.role != 'agent') {
            return res.status(403).json({ message: 'This page is only accessible to agents' });
        }
        next();
       }catch(err){
           console.log(err)
       }
    },

    ensureDonorLoggedIn: (req, res, next) => {
        try{
                    if (req.isUnauthenticated()) {
                return res.status(401).json({ message: 'You need to login first' });
            }
            if (!req.user || req.user.role != 'donor') {
                return res.status(403).json({ message: 'This page is only accessible to donors' });
            }
            next();
        }catch(err){
            console.log(err)
        }
    },

    ensureNotLoggedIn: (req, res, next) => {
        if (req.isUnauthenticated()) {
            return next();
        }
        res.status(400).json({ message: 'You are already logged in' });
    }
}

module.exports = middleware;
