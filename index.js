const express = require('express');
const { Pool } = require('pg');
const dotenv= require('dotenv');
dotenv.config();
const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get('/fetch_users',async (req,res)=>{
    try {
      const result = await pool.query("SELECT * from users; ");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching data');
    }
})

app.post('/add_user',async (req,res)=>{
    const {id,username,email,password,address} = req.query;
    try{
        await pool.query("INSERT INTO users (id,username,email,password,address) VALUES ($1,$2,$3,$4,$5)",[id,username,email,password,address]);
        res.status(201).send('User added successfully');
    }
    catch(err){
        console.error(err);
        res.status(500).send('Error adding user');
    }
})

app.put('/update-user', async (req, res) => {
    try{
        const {id,columnname,newValue} = req.query;
        const existinguser = await pool.query('SELECT * FROM users WHERE id = ' + Number(id));
        if(existinguser.rowCount === 0){
            await pool.query("INSERT INTO users (id,username,email,password,address) VALUES ($1,$2,$3,$4,$5)",[Number(id),null,null,null,null]);
        }
        await pool.query("UPDATE users SET " + columnname + " = $1 WHERE id = $2", [newValue, Number(id)]);
        res.status(200).send('User updated successfully');
    }
    catch(err){
        console.error(err);
        res.status(500).send('Error updating user');
    }
})

app.delete('/delete-user', async (req, res) => {
  const { id } = req.query;
  try {
      const result = await pool.query('DELETE FROM users WHERE id = $1', [Number(id)]);
      if (result.rowCount === 0) {
          return res.status(404).send('User not found');
      }
      res.status(200).send('User deleted successfully');
  } catch (err) {
      console.error(err);
      res.status(500).send('Error deleting user');
  }
});
  
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});