import React, { useState, useEffect } from 'react';
import MultiSelect from "react-multi-select-component";

class BrandOption
{
   constructor(brand) 
   {
      if(brand)
      {
         this.label = brand;
         this.value = "opt" + brand;
      }
   }
}

const MultipleFilter = (props) => 
{
   const categoryOptions = [
      { label: "A", value: "optA" },
      { label: "B", value: "optB" },
      { label: "C", value: "optC" },
      { label: "D", value: "optD" },
      { label: "E", value: "optE" },
   ];
   const [selectedCategory, setSelectedCategory] = useState([]);
   const [selectedBrand, setSelectedBrand] = useState([]);

   //Genero i marchi disponibili.
   const getBrandOptions = () =>
   {
      return props.brands.map((brand) => new BrandOption(brand));
   }

   //ComponentDidUpdate
   useEffect(() => 
   {  
      const categoriesSelected = selectedCategory.map((category) => category.label).sort();
      const brandsSelected = selectedBrand.map((brand) => brand.label).sort();
      props.doFiltering(categoriesSelected, brandsSelected);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [selectedCategory, selectedBrand]);

   return (
   <>    
      <br></br>  
      <h6>Select a category</h6>
      <MultiSelect options={categoryOptions} value={selectedCategory} onChange={setSelectedCategory} labelledBy={"Select... "}></MultiSelect>
      <br></br>  
      <h6>Select a brand</h6>
      <MultiSelect options={getBrandOptions()} value={selectedBrand} onChange={setSelectedBrand} labelledBy={"Select... "}></MultiSelect>
   </>
   );
};

export default MultipleFilter;
