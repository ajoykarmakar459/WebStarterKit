const rcs = require('rename-css-selectors');

// async/await
(async () => {
    try {
        await rcs.process.auto(['./build/library/js/app-min.js', './build/*.html', './build/library/style/app.css']);
        await rcs.generateMapping('./', { overwrite: true });
    } catch (err) {
        console.error(err);
    }
})();
