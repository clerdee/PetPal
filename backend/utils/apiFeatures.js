// backend/utils/apiFeatures.js

class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;     // Mongoose query (e.g., Product.find())
        this.queryStr = queryStr; // URL query parameters (e.g., req.query)
    }

    // 1. SEARCH: Finds products matching a keyword
    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i' // Case-insensitive
            }
        } : {};

        this.query = this.query.find({ ...keyword });
        return this;
    }

    // 2. FILTER: Handles category, price, and ratings filtering
    filter() {
        const queryCopy = { ...this.queryStr };

        // Fields to remove from the query (things that aren't filters)
        const removeFields = ['keyword', 'limit', 'page'];
        removeFields.forEach(el => delete queryCopy[el]);

        // --- THIS IS THE NEW, CORRECT LOGIC ---
        
        // queryCopy is now { category: 'Food', 'price[gte]': '401', 'ratings[gte]': '1' }

        const mongoQuery = {}; // We will build the valid MongoDB query object here

        for (const key in queryCopy) {
            const value = queryCopy[key];

            if (key.includes('[')) {
                // It's an advanced filter like 'price[gte]'
                
                // 1. Get the field name ('price' or 'ratings')
                const field = key.split('[')[0]; 
                
                // 2. Get the operator ('gte', 'lte', etc.)
                const operator = key.match(/\[(.*?)\]/)[1]; 

                // 3. Create the nested object if it doesn't exist
                if (!mongoQuery[field]) {
                    mongoQuery[field] = {};
                }
                
                // 4. Add the operator and value
                // We MUST convert the value to a Number for price/rating
                mongoQuery[field][`$${operator}`] = Number(value);
                
                // Result: mongoQuery builds { price: { $gte: 401 } }
                
            } else {
                // It's a simple filter like 'category'
                mongoQuery[key] = value;
                // Result: mongoQuery builds { category: 'Food' }
            }
        }
        
        // After the loop, mongoQuery = { category: 'Food', price: { $gte: 401 }, ratings: { $gte: 1 } }
        // This is a perfect MongoDB query.
        this.query = this.query.find(mongoQuery);
        
        return this;
    }

    // 3. PAGINATION: Handles limiting results for infinite scroll
    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }
}

module.exports = APIFeatures;