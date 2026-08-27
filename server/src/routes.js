const express = require('express');
const router = express.Router();
const db = require('./db');

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==========================================
// PROJECTS
// ==========================================

// Get all projects with count of columns and cards
router.get('/projects', async (req, res, next) => {
  try {
    const query = `
      SELECT 
        p.*,
        COUNT(DISTINCT c.id) AS column_count,
        COUNT(DISTINCT cd.id) AS card_count
      FROM projects p
      LEFT JOIN columns c ON c.project_id = p.id
      LEFT JOIN cards cd ON cd.column_id = c.id
      GROUP BY p.id
      ORDER BY p.created_at ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Create project (with default 4 columns)
router.post('/projects', async (req, res, next) => {
  const client = await db.getPool().connect();
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    await client.query('BEGIN');

    const projRes = await client.query(
      `INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *`,
      [name.trim(), description || '']
    );
    const project = projRes.rows[0];

    const defaultColumns = [
      { name: 'Para fazer', pos: 0 },
      { name: 'Fazendo', pos: 1 },
      { name: 'Completo', pos: 2 },
      { name: 'Não deu certo', pos: 3 },
    ];

    for (const col of defaultColumns) {
      await client.query(
        `INSERT INTO columns (project_id, name, position) VALUES ($1, $2, $3)`,
        [project.id, col.name, col.pos]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(project);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Update project
router.put('/projects/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const result = await db.query(
      `UPDATE projects SET name = $1, description = $2 WHERE id = $3 RETURNING *`,
      [name.trim(), description || '', id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete project
router.delete('/projects/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`DELETE FROM projects WHERE id = $1 RETURNING *`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully', project: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Get full board data for a project
router.get('/projects/:id/board', async (req, res, next) => {
  try {
    const { id } = req.params;

    const projRes = await db.query(`SELECT * FROM projects WHERE id = $1`, [id]);
    if (projRes.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const project = projRes.rows[0];

    const colRes = await db.query(
      `SELECT * FROM columns WHERE project_id = $1 ORDER BY position ASC, id ASC`,
      [id]
    );
    const columns = colRes.rows;

    const columnIds = columns.map(c => c.id);
    let cards = [];
    if (columnIds.length > 0) {
      const cardsRes = await db.query(
        `SELECT * FROM cards WHERE column_id = ANY($1::int[]) ORDER BY position ASC, id ASC`,
        [columnIds]
      );
      cards = cardsRes.rows;
    }

    const columnsWithCards = columns.map(col => ({
      ...col,
      cards: cards.filter(card => card.column_id === col.id),
    }));

    res.json({
      project,
      columns: columnsWithCards,
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// COLUMNS
// ==========================================

// Create column
router.post('/projects/:projectId/columns', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Column name is required' });
    }

    // Get highest position
    const posRes = await db.query(
      `SELECT COALESCE(MAX(position), -1) as max_pos FROM columns WHERE project_id = $1`,
      [projectId]
    );
    const position = posRes.rows[0].max_pos + 1;

    const result = await db.query(
      `INSERT INTO columns (project_id, name, position) VALUES ($1, $2, $3) RETURNING *`,
      [projectId, name.trim(), position]
    );

    res.status(201).json({ ...result.rows[0], cards: [] });
  } catch (err) {
    next(err);
  }
});

// Update column
router.put('/columns/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, position } = req.body;

    let query = `UPDATE columns SET `;
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      query += `name = $${idx++}, `;
      values.push(name.trim());
    }
    if (position !== undefined) {
      query += `position = $${idx++}, `;
      values.push(position);
    }

    query = query.slice(0, -2);
    query += ` WHERE id = $${idx} RETURNING *`;
    values.push(id);

    const result = await db.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Column not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete column
router.delete('/columns/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`DELETE FROM columns WHERE id = $1 RETURNING *`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Column not found' });
    }
    res.json({ message: 'Column deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// CARDS
// ==========================================

// Create card
router.post('/columns/:columnId/cards', async (req, res, next) => {
  try {
    const { columnId } = req.params;
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Card title is required' });
    }

    // Get max position in this column
    const posRes = await db.query(
      `SELECT COALESCE(MAX(position), -1) as max_pos FROM cards WHERE column_id = $1`,
      [columnId]
    );
    const position = posRes.rows[0].max_pos + 1;

    const result = await db.query(
      `INSERT INTO cards (column_id, title, description, position) VALUES ($1, $2, $3, $4) RETURNING *`,
      [columnId, title.trim(), description || '', position]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update card
router.put('/cards/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, column_id } = req.body;

    let query = `UPDATE cards SET updated_at = CURRENT_TIMESTAMP, `;
    const values = [];
    let idx = 1;

    if (title !== undefined) {
      query += `title = $${idx++}, `;
      values.push(title.trim());
    }
    if (description !== undefined) {
      query += `description = $${idx++}, `;
      values.push(description);
    }
    if (column_id !== undefined) {
      query += `column_id = $${idx++}, `;
      values.push(column_id);
    }

    query = query.slice(0, -2);
    query += ` WHERE id = $${idx} RETURNING *`;
    values.push(id);

    const result = await db.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete card
router.delete('/cards/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`DELETE FROM cards WHERE id = $1 RETURNING *`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json({ message: 'Card deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Move card (between columns or reorder within column)
router.patch('/cards/:id/move', async (req, res, next) => {
  const client = await db.getPool().connect();
  try {
    const { id } = req.params;
    const { targetColumnId, newPosition } = req.body;

    if (targetColumnId === undefined || newPosition === undefined) {
      return res.status(400).json({ error: 'targetColumnId and newPosition are required' });
    }

    await client.query('BEGIN');

    // Get current card
    const currentCardRes = await client.query(`SELECT * FROM cards WHERE id = $1`, [id]);
    if (currentCardRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Card not found' });
    }
    const currentCard = currentCardRes.rows[0];
    const sourceColumnId = currentCard.column_id;
    const oldPosition = currentCard.position;
    const targetCol = parseInt(targetColumnId, 10);
    const newPos = parseInt(newPosition, 10);

    if (sourceColumnId === targetCol) {
      // Reordering within the same column
      if (oldPosition < newPos) {
        // Shift items between oldPosition+1 and newPos DOWN (decrement)
        await client.query(
          `UPDATE cards SET position = position - 1 
           WHERE column_id = $1 AND position > $2 AND position <= $3`,
          [sourceColumnId, oldPosition, newPos]
        );
      } else if (oldPosition > newPos) {
        // Shift items between newPos and oldPosition-1 UP (increment)
        await client.query(
          `UPDATE cards SET position = position + 1 
           WHERE column_id = $1 AND position >= $2 AND position < $3`,
          [sourceColumnId, newPos, oldPosition]
        );
      }
      // Update moved card
      const updatedCard = await client.query(
        `UPDATE cards SET position = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [newPos, id]
      );
      await client.query('COMMIT');
      return res.json(updatedCard.rows[0]);
    } else {
      // Moving to different column
      // 1. Shift down cards in source column that were after oldPosition
      await client.query(
        `UPDATE cards SET position = position - 1 
         WHERE column_id = $1 AND position > $2`,
        [sourceColumnId, oldPosition]
      );

      // 2. Shift up cards in target column that are at or after newPos
      await client.query(
        `UPDATE cards SET position = position + 1 
         WHERE column_id = $1 AND position >= $2`,
        [targetCol, newPos]
      );

      // 3. Move and update the card
      const updatedCard = await client.query(
        `UPDATE cards SET column_id = $1, position = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
        [targetCol, newPos, id]
      );

      await client.query('COMMIT');
      return res.json(updatedCard.rows[0]);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
