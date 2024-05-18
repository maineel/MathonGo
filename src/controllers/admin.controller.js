import {List} from "../models/list.model.js";
import fs from "fs";
import fastcsv from "fast-csv";
import createCsvWriter from "csv-writer";

const listController = async (req, res) => {
  try {
    const { title, customProperties } = req.body;
    const list = new List({ title, customProperties });
    await list.save();

    res.status(201).json({ list });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

const userController = async (req, res) => {
  try {
    const { listId } = req.params;
    const list = await List.findById(listId);
    const fileRows = [];
    const errors = [];

    fastcsv
      .parseFile(req.file.path)
      .on("data", function (data) {
        const user = { name: data[0], email: data[1], listId };
        list.customProperties.forEach((prop, index) => {
          user[prop.title] = data[index + 2] || prop.default_value;
        });
        fileRows.push(user);
      })
      .on("end", async function () {
        fs.unlinkSync(req.file.path);
        for (const row of fileRows) {
          try {
            await User.create(row);
          } catch (error) {
            errors.push({ ...row, error: error.toString() });
          }
        }

        if (errors.length > 0) {
          const csvWriter = createCsvWriter.createObjectCsvWriter({
            path: "out.csv",
            header: Object.keys(errors[0]).map((key) => ({
              id: key,
              title: key,
            })),
          });
          await csvWriter.writeRecords(errors);
        }

        res.send({
          message: "Users added successfully",
          added: fileRows.length - errors.length,
          errors: errors.length,
          total: await User.countDocuments({ listId }),
          errorFile: errors.length > 0 ? "out.csv" : null,
        });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export { listController, userController };
