//Libraries
const express = require('express');
const multer = require('multer');
const mysql = require('mysql2/promise');
const { check, validationResult } = require('express-validator');
//const course = require('./Model/course');

//Setup defaults for script
const app = express();
app.use(express.static("public"));

//Stylesheet
app.use(express.static(__dirname + '/public'));
//Webpage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const upload = multer()
const port = 8080 //Default port to http server

let connection = null;



async function query(sql, params) {
    //Singleton DB connection
    if (null === connection) {
        console.log('Here');
        connection = await mysql.createConnection({
            host: "student-databases.cvode4s4cwrc.us-west-2.rds.amazonaws.com",
            user: "DONOVANRAMIREZ",
            password: "utpMeBEuZ0D8gRpUsu3zpaI7wh5jFq6X5oQ",
            database: 'DONOVANRAMIREZ'
        });
    }
    const [results, ] = await connection.execute(sql, params);
    return results;
}

//The * in app.* needs to match the method type of the request
app.get(
    '/playercharacters/', 
    upload.none(), 
    async (request, response) => {
        let result = {};
        try {
            let selectSql = `SELECT
                        pc.character_name,
                        pc.race,
                        pc.\`class\`,
                        pc.level,
                        pl.strength,
                        pl.dexterity,
                        pl.constitution,
                        pl.intelligence,
                        pl.wisdom,
                        pl.charisma
                    FROM dnd_player_characters pc
                    INNER JOIN dnd_player_levels pl ON pc.character_name = pl.character_id`,
                whereStatements = [],
                orderByStatements = [],
                queryParameters = [];
        
            //#region Character Stats Requests //

            if (typeof request.query.character_name !== 'undefined') {
                whereStatements.push('LOWER(pc.character_name) LIKE LOWER(?)');
                queryParameters.push('%' + request.query.character_name + '%');
            }
        
            if (typeof request.query.race !== 'undefined') {
                whereStatements.push('LOWER(pc.race) LIKE LOWER(?)');
                queryParameters.push('%' + request.query.race + '%');
            }
        
            if (typeof request.query.class !== 'undefined') {
                whereStatements.push('LOWER(pc.\`class\`) LIKE LOWER(?)');
                queryParameters.push('%' + request.query.class + '%');
            }
            
            //Specific Level
            if (typeof request.query.level !== 'undefined') {
                whereStatements.push('pc.level = ?');
                queryParameters.push(request.query.level);
            }
            
            //Sort by Level, ascending/descending
            if(typeof request.query.sort !== 'undefined'){
                orderByStatements.push('pc.level ' + request.query.sort);
                queryParameters.push(request.query.sort);
            }
            //#endregion
            
            //#region Character Stats Requests //
            
            //Strength request
            if(typeof request.query.strength !== 'undefined'){
                whereStatements.push('pl.strength = ?');
                queryParameters.push(request.query.strength);
            }

            //Dexterity request
            if(typeof request.query.dexterity !== 'undefined'){
                whereStatements.push('pl.dexterity = ?');
                queryParameters.push(request.query.dexterity);
            }

            //Constitution request
            if(typeof request.query.constitution !== 'undefined'){
                whereStatements.push('pl.constitution = ?');
                queryParameters.push(request.query.constitution);
            }

            //Intelligence request
            if(typeof request.query.intelligence !== 'undefined'){
                whereStatements.push('pl.intelligence = ?');
                queryParameters.push(request.query.intelligence);
            }

            //Wisdom request
            if(typeof request.query.wisdom !== 'undefined'){
                whereStatements.push('pl.wisdom = ?');
                queryParameters.push(request.query.wisdom);
            }

            //Charisma request
            if(typeof request.query.charisma !== 'undefined'){
                whereStatements.push('pl.charisma = ?');
                queryParameters.push(request.query.charisma);
            }
            //#endregion


            //Dynamically add WHERE expressions to SELECT statements if needed
            if (whereStatements.length > 0) {
                selectSql = selectSql + ' WHERE ' + whereStatements.join(' AND ');
            }
        
            //Dynamically add ORDER BY expressions to SELECT statements if needed
            if (orderByStatements.length > 0) {
                selectSql = selectSql + ' ORDER BY ' + orderByStatements.join(', ');
            }
        
            //Dynamically add LIMIT expressions to SELECT statements if needed
            if (typeof request.query.limit !== 'undefined' && request.query.limit > 1) {
                selectSql = selectSql + ' LIMIT ' + request.query.limit;
            }
        
            result = await query(selectSql, queryParameters);
        } catch (error) {
            console.log(error);
            return response.status(500) //Error code 
                .json({message: 'Something went wrong with the server.'});
        }
        //Default response object
        response.json({'data': result});
});

app.post(
    '/playercharacters/', 
    upload.none(),
    check('character_name_insert', 'Please enter the character name.').isLength({min: 1}),
    check('character_name_insert', 'Please enter a shorter name.').isLength({max: 50}),
    check('character_class_insert', 'Please enter the character class.').isLength({ min: 1 }),
    check('character_race_insert', 'Please enter the character race.').isLength({ min: 1 }),
    check('character_level_insert', 'Please enter a level between 1 and 20.').isInt({ min: 1, max: 20 }),
    check('character_strength_insert', 'Strength: Please enter a stat at of least 1.').isInt({ min: 1 }),
    check('character_dexterity_insert', 'Dexterity: Please enter a stat at least 1.').isInt({ min: 1}),
    check('character_constitution_insert', 'Constitution: Please enter a stat at least 1.').isInt({ min: 1}),
    check('character_intelligence_insert', 'Intelligence: Please enter a stat at least 1.').isInt({ min: 1}),
    check('character_wisdom_insert', 'Wisdom: Please enter a stat at least 1.').isInt({ min: 1}),
    check('character_charisma_insert', 'Charisma: Please enter a stat at least 1.').isInt({ min: 1}),
    async (request, response) => {
        //console.log(request.body.choice); //request.body is only non-file data from the request
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            return response
                .status(400)
                .setHeader('Access-Control-Allow-Origin', '*') //Prevent CORS error
                .json({
                    message: 'Request fields or files are invalid.',
                    errors: errors.array(),
                });
        } else {
            try {
                // Insert into dnd_player_characters
                let insertCharacterSql = `INSERT INTO dnd_player_characters (character_name, race, \`class\`, level) VALUES (?, ?, ?, ?)`;
                let characterParams = [
                    request.body.character_name_insert,
                    request.body.character_race_insert,
                    request.body.character_class_insert,
                    request.body.character_level_insert
                ];
                
                await query(insertCharacterSql, characterParams);
                
                // Insert into dnd_player_levels
                let insertLevelsSql = `INSERT INTO dnd_player_levels (character_id, strength, dexterity, constitution, intelligence, wisdom, charisma) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                let levelsParams = [
                    request.body.character_name_insert,
                    request.body.character_strength_insert,
                    request.body.character_dexterity_insert,
                    request.body.character_constitution_insert,
                    request.body.character_intelligence_insert,
                    request.body.character_wisdom_insert,
                    request.body.character_charisma_insert
                ];
                
                await query(insertLevelsSql, levelsParams);
                
                response.statusCode = 200;
                response.setHeader('Access-Control-Allow-Origin', '*');
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify({ message: 'Character created successfully.' }));
            } catch (error) {
                console.log(error);
                response.statusCode = 500;
                response.setHeader('Access-Control-Allow-Origin', '*');
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify({ message: 'Error creating character.' }));
            }
        }

});

app.put(
    '/playercharacters/', 
    upload.none(),
    check('character_originalName_update', 'Please enter the original character name.').isLength({min: 1}),
    check('character_name_update', 'Please enter the new character name.').isLength({min: 1}),
    check('character_name_update', 'Please enter a shorter name.').isLength({max: 50}),
    check('character_class_update', 'Please enter the character class.').isLength({ min: 1 }),
    check('character_race_update', 'Please enter the character race.').isLength({ min: 1 }),
    check('character_level_update', 'Please enter a level between 1 and 20.').isInt({ min: 1, max: 20 }),
    check('character_strength_insert', 'Strength: Please enter a stat at of least 1.').isInt({ min: 1 }),
    check('character_dexterity_insert', 'Dexterity: Please enter a stat at least 1.').isInt({ min: 1}),
    check('character_constitution_insert', 'Constitution: Please enter a stat at least 1.').isInt({ min: 1}),
    check('character_intelligence_insert', 'Intelligence: Please enter a stat at least 1.').isInt({ min: 1}),
    check('character_wisdom_insert', 'Wisdom: Please enter a stat at least 1.').isInt({ min: 1}),
    check('character_charisma_insert', 'Charisma: Please enter a stat at least 1.').isInt({ min: 1}),
    async (request, response) => {
        //console.log(request.body.choice); //request.body is only non-file data from the request
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            return response
                .status(400)
                .setHeader('Access-Control-Allow-Origin', '*') //Prevent CORS error
                .json({
                    message: 'Request fields or files are invalid.',
                    errors: errors.array(),
                });
        } else {
            try {
                // Insert into dnd_player_characters
                let updateCharacterSql = `UPDATE dnd_player_characters SET character_name = ?, race = ?, \`class\` = ?, level = ? WHERE character_name = ?`;
                let characterParams = [
                    request.body.character_name_update,
                    request.body.character_race_update,
                    request.body.character_class_update,
                    request.body.character_level_update,
                    request.body.character_originalName_update
                ];
                
                await query(updateCharacterSql, characterParams);
                
                // Insert into dnd_player_levels
                let updateLevelsSql = `UPDATE dnd_player_levels SET character_id = ?, strength = ?, dexterity = ?, constitution = ?, intelligence = ?, wisdom = ?, charisma = ? WHERE character_id = ?`;
                let levelsParams = [
                    request.body.character_name_update,
                    request.body.character_strength_update,
                    request.body.character_dexterity_update,
                    request.body.character_constitution_update,
                    request.body.character_intelligence_update,
                    request.body.character_wisdom_update,
                    request.body.character_charisma_update,
                    request.body.character_originalName_update
                ];
                
                await query(updateLevelsSql, levelsParams);
                
                response.statusCode = 200;
                response.setHeader('Access-Control-Allow-Origin', '*');
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify({ message: 'Character created successfully.' }));
            } catch (error) {
                console.log(error);
                response.statusCode = 500;
                response.setHeader('Access-Control-Allow-Origin', '*');
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify({ message: 'Error creating character.' }));
            }
        }

});


app.listen(port, () => {
    console.log(`Application listening at http://localhost:${port}`);
})