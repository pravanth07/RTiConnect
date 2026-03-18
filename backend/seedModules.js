const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Department = require("./models/Department");
const RTITemplate = require("./models/RTITemplate");

const departments = [
  {
    name: "Department of Education",
    code: "EDU",
    description: "Handles all education-related queries including schools, colleges, scholarships, and exam results",
    keywords: ["education", "school", "college", "university", "scholarship", "exam", "result", "teacher", "student", "admission", "fee", "syllabus", "board", "degree", "certificate", "hostel", "library"],
  },
  {
    name: "Department of Health & Family Welfare",
    code: "HFW",
    description: "Manages healthcare services, hospitals, medical facilities, and public health programs",
    keywords: ["health", "hospital", "doctor", "medicine", "medical", "clinic", "ambulance", "vaccination", "disease", "treatment", "pharmacy", "nurse", "patient", "insurance", "ayushman", "aarogya"],
  },
  {
    name: "Department of Revenue & Land Records",
    code: "RLR",
    description: "Handles land records, property registration, mutations, revenue collection, and land disputes",
    keywords: ["land", "property", "registration", "mutation", "revenue", "survey", "patta", "pahani", "encumbrance", "stamp", "deed", "plot", "agricultural", "tenant", "record", "dharani"],
  },
  {
    name: "Department of Police",
    code: "POL",
    description: "Law enforcement, FIR status, crime records, traffic, and public safety",
    keywords: ["police", "fir", "crime", "theft", "accident", "traffic", "challan", "complaint", "investigation", "arrest", "missing", "cybercrime", "station", "constable", "officer", "safety"],
  },
  {
    name: "Municipal Administration",
    code: "MUN",
    description: "Handles municipal services including water supply, sanitation, building permissions, and city infrastructure",
    keywords: ["municipal", "water", "drainage", "garbage", "building", "permission", "road", "streetlight", "sanitation", "sewage", "tax", "property tax", "birth", "death", "certificate", "trade", "license", "park"],
  },
  {
    name: "Department of Public Works",
    code: "PWD",
    description: "Responsible for construction and maintenance of roads, bridges, and government buildings",
    keywords: ["road", "bridge", "construction", "highway", "building", "government building", "contractor", "tender", "maintenance", "pothole", "flyover", "infrastructure"],
  },
  {
    name: "Department of Finance & Treasury",
    code: "FIN",
    description: "Manages government finances, pensions, salary disbursement, and treasury operations",
    keywords: ["pension", "salary", "finance", "budget", "treasury", "payment", "provident fund", "gpf", "retirement", "gratuity", "tax", "income", "expenditure", "audit"],
  },
  {
    name: "Department of Employment & Labour",
    code: "EMP",
    description: "Handles employment exchanges, labour welfare, minimum wages, and industrial disputes",
    keywords: ["employment", "job", "labour", "worker", "wage", "minimum wage", "factory", "industrial", "welfare", "esi", "provident", "unemployment", "recruitment", "vacancy"],
  },
  {
    name: "Department of Environment & Forests",
    code: "ENV",
    description: "Manages environmental protection, forest conservation, wildlife, and pollution control",
    keywords: ["environment", "forest", "pollution", "air", "water", "tree", "wildlife", "mining", "waste", "climate", "green", "conservation", "plantation", "deforestation"],
  },
  {
    name: "Department of Social Welfare",
    code: "SOC",
    description: "Handles social welfare schemes, SC/ST/OBC welfare, disability benefits, and women empowerment",
    keywords: ["welfare", "scheme", "sc", "st", "obc", "minority", "disability", "pension", "widow", "women", "child", "aadhar", "ration", "bpl", "caste", "certificate", "reservation"],
  },
];

const templates = [
  {
    title: "Road Condition & Repair Status",
    category: "Infrastructure",
    department: "Department of Public Works",
    description: "Ask about road conditions, repair work, and maintenance schedules in your area",
    templateBody: `To,
The Public Information Officer,
Department of Public Works,
{{DISTRICT_NAME}} District.

Subject: Information regarding road condition and repair work

Date: {{DATE}}

Respected Sir/Madam,

Under the provisions of the Right to Information Act, 2005, I would like to request the following information:

1. What is the current status of road repair/construction work on {{ROAD_NAME}} in {{AREA_NAME}}, {{DISTRICT_NAME}}?
2. What is the total budget allocated for road maintenance in {{AREA_NAME}} for the financial year {{FINANCIAL_YEAR}}?
3. How much of the allocated budget has been utilized so far?
4. What is the expected completion date for the ongoing road work (if any)?
5. Please provide copies of the contractor details and work order for the above road.

I am willing to pay the prescribed fee for the above information.

Thanking you,
{{APPLICANT_NAME}}
{{APPLICANT_ADDRESS}}
Phone: {{PHONE_NUMBER}}`,
    placeholders: [
      { key: "{{DISTRICT_NAME}}", label: "District Name", type: "text", required: true },
      { key: "{{ROAD_NAME}}", label: "Road/Street Name", type: "text", required: true },
      { key: "{{AREA_NAME}}", label: "Area/Locality Name", type: "text", required: true },
      { key: "{{FINANCIAL_YEAR}}", label: "Financial Year (e.g. 2024-25)", type: "text", required: true },
      { key: "{{APPLICANT_NAME}}", label: "Your Full Name", type: "text", required: true },
      { key: "{{APPLICANT_ADDRESS}}", label: "Your Address", type: "textarea", required: true },
      { key: "{{PHONE_NUMBER}}", label: "Phone Number", type: "text", required: true },
    ],
    sampleQuestions: [
      "What is the budget for road repairs in my area?",
      "When will the road construction be completed?",
      "Who is the contractor for this road project?",
    ],
  },
  {
    title: "School / College Information",
    category: "Education",
    department: "Department of Education",
    description: "Request information about schools, teacher appointments, exam results, and scholarships",
    templateBody: `To,
The Public Information Officer,
Department of Education,
{{DISTRICT_NAME}} District.

Subject: Request for information regarding {{TOPIC}}

Date: {{DATE}}

Respected Sir/Madam,

Under the provisions of the Right to Information Act, 2005, I seek the following information:

1. {{QUESTION_1}}
2. {{QUESTION_2}}
3. {{QUESTION_3}}

The above information pertains to {{INSTITUTION_NAME}} located in {{AREA_NAME}}, {{DISTRICT_NAME}}.

I am willing to pay the prescribed fee for the above information.

Thanking you,
{{APPLICANT_NAME}}
{{APPLICANT_ADDRESS}}
Phone: {{PHONE_NUMBER}}`,
    placeholders: [
      { key: "{{DISTRICT_NAME}}", label: "District Name", type: "text", required: true },
      { key: "{{TOPIC}}", label: "Topic (e.g. Teacher vacancies, Scholarship status)", type: "text", required: true },
      { key: "{{INSTITUTION_NAME}}", label: "School/College Name", type: "text", required: true },
      { key: "{{AREA_NAME}}", label: "Area/Mandal Name", type: "text", required: true },
      { key: "{{QUESTION_1}}", label: "Question 1", type: "textarea", required: true },
      { key: "{{QUESTION_2}}", label: "Question 2", type: "textarea", required: false },
      { key: "{{QUESTION_3}}", label: "Question 3", type: "textarea", required: false },
      { key: "{{APPLICANT_NAME}}", label: "Your Full Name", type: "text", required: true },
      { key: "{{APPLICANT_ADDRESS}}", label: "Your Address", type: "textarea", required: true },
      { key: "{{PHONE_NUMBER}}", label: "Phone Number", type: "text", required: true },
    ],
    sampleQuestions: [
      "How many teacher posts are vacant in this school?",
      "What is the scholarship disbursement status?",
      "Provide details of mid-day meal budget utilization",
    ],
  },
  {
    title: "Hospital / Healthcare Facility Information",
    category: "Healthcare",
    department: "Department of Health & Family Welfare",
    description: "Get information about hospitals, doctor availability, medical equipment, and health schemes",
    templateBody: `To,
The Public Information Officer,
Department of Health & Family Welfare,
{{DISTRICT_NAME}} District.

Subject: Request for information regarding {{HOSPITAL_NAME}}

Date: {{DATE}}

Respected Sir/Madam,

Under the Right to Information Act, 2005, I request the following information:

1. How many doctors and specialists are currently posted at {{HOSPITAL_NAME}}, {{AREA_NAME}}?
2. What is the availability status of {{EQUIPMENT_OR_SERVICE}} at this facility?
3. {{ADDITIONAL_QUESTION}}
4. Please provide the budget allocation and expenditure details for this hospital for the year {{FINANCIAL_YEAR}}.

I am ready to pay the prescribed fee.

Thanking you,
{{APPLICANT_NAME}}
{{APPLICANT_ADDRESS}}
Phone: {{PHONE_NUMBER}}`,
    placeholders: [
      { key: "{{DISTRICT_NAME}}", label: "District Name", type: "text", required: true },
      { key: "{{HOSPITAL_NAME}}", label: "Hospital/PHC Name", type: "text", required: true },
      { key: "{{AREA_NAME}}", label: "Area/Mandal Name", type: "text", required: true },
      { key: "{{EQUIPMENT_OR_SERVICE}}", label: "Equipment/Service (e.g. X-Ray, ICU beds)", type: "text", required: true },
      { key: "{{ADDITIONAL_QUESTION}}", label: "Any Additional Question", type: "textarea", required: false },
      { key: "{{FINANCIAL_YEAR}}", label: "Financial Year (e.g. 2024-25)", type: "text", required: true },
      { key: "{{APPLICANT_NAME}}", label: "Your Full Name", type: "text", required: true },
      { key: "{{APPLICANT_ADDRESS}}", label: "Your Address", type: "textarea", required: true },
      { key: "{{PHONE_NUMBER}}", label: "Phone Number", type: "text", required: true },
    ],
    sampleQuestions: [
      "How many doctors are posted at the district hospital?",
      "Is the CT scan machine functional?",
      "What medicines are available under free distribution?",
    ],
  },
  {
    title: "Land Record & Property Information",
    category: "Land & Revenue",
    department: "Department of Revenue & Land Records",
    description: "Request land records, property details, mutation status, and survey information",
    templateBody: `To,
The Public Information Officer,
Department of Revenue & Land Records,
{{DISTRICT_NAME}} District.

Subject: Request for land/property records information

Date: {{DATE}}

Respected Sir/Madam,

Under the RTI Act, 2005, I request the following information:

1. Please provide certified copies of land records for Survey No. {{SURVEY_NUMBER}} in {{VILLAGE_NAME}}, {{MANDAL_NAME}}, {{DISTRICT_NAME}}.
2. What is the current mutation status for the above property?
3. {{ADDITIONAL_QUESTION}}
4. Please provide details of any pending disputes or encumbrances on this property.

I am willing to pay the prescribed fee.

Thanking you,
{{APPLICANT_NAME}}
{{APPLICANT_ADDRESS}}
Phone: {{PHONE_NUMBER}}`,
    placeholders: [
      { key: "{{DISTRICT_NAME}}", label: "District Name", type: "text", required: true },
      { key: "{{SURVEY_NUMBER}}", label: "Survey Number / Plot Number", type: "text", required: true },
      { key: "{{VILLAGE_NAME}}", label: "Village Name", type: "text", required: true },
      { key: "{{MANDAL_NAME}}", label: "Mandal/Taluka Name", type: "text", required: true },
      { key: "{{ADDITIONAL_QUESTION}}", label: "Any Additional Question", type: "textarea", required: false },
      { key: "{{APPLICANT_NAME}}", label: "Your Full Name", type: "text", required: true },
      { key: "{{APPLICANT_ADDRESS}}", label: "Your Address", type: "textarea", required: true },
      { key: "{{PHONE_NUMBER}}", label: "Phone Number", type: "text", required: true },
    ],
    sampleQuestions: [
      "Provide pahani/adangal for my land survey number",
      "What is the mutation status of my property transfer?",
      "Are there any encumbrances on this land?",
    ],
  },
  {
    title: "Police FIR / Complaint Status",
    category: "Police",
    department: "Department of Police",
    description: "Get information about FIR status, complaint progress, and police actions",
    templateBody: `To,
The Public Information Officer,
Office of the Superintendent of Police,
{{DISTRICT_NAME}} District.

Subject: Information regarding FIR/Complaint No. {{FIR_NUMBER}}

Date: {{DATE}}

Respected Sir/Madam,

Under the RTI Act, 2005, I request the following information:

1. What is the current investigation status of FIR/Complaint No. {{FIR_NUMBER}} filed at {{POLICE_STATION}} Police Station on {{FIR_DATE}}?
2. Who is the investigating officer assigned to this case?
3. What actions have been taken so far in this matter?
4. {{ADDITIONAL_QUESTION}}

I am ready to pay the prescribed fee.

Thanking you,
{{APPLICANT_NAME}}
{{APPLICANT_ADDRESS}}
Phone: {{PHONE_NUMBER}}`,
    placeholders: [
      { key: "{{DISTRICT_NAME}}", label: "District Name", type: "text", required: true },
      { key: "{{FIR_NUMBER}}", label: "FIR/Complaint Number", type: "text", required: true },
      { key: "{{POLICE_STATION}}", label: "Police Station Name", type: "text", required: true },
      { key: "{{FIR_DATE}}", label: "Date of FIR Filing", type: "date", required: true },
      { key: "{{ADDITIONAL_QUESTION}}", label: "Any Additional Question", type: "textarea", required: false },
      { key: "{{APPLICANT_NAME}}", label: "Your Full Name", type: "text", required: true },
      { key: "{{APPLICANT_ADDRESS}}", label: "Your Address", type: "textarea", required: true },
      { key: "{{PHONE_NUMBER}}", label: "Phone Number", type: "text", required: true },
    ],
    sampleQuestions: [
      "What is the status of my FIR?",
      "Who is the investigating officer?",
      "Has the chargesheet been filed?",
    ],
  },
  {
    title: "Municipal Services & Civic Issues",
    category: "Municipal",
    department: "Municipal Administration",
    description: "Ask about water supply, sanitation, building permits, property tax, and other civic issues",
    templateBody: `To,
The Public Information Officer,
Municipal Corporation / Municipality,
{{CITY_NAME}}, {{DISTRICT_NAME}}.

Subject: Information regarding {{SERVICE_TYPE}} in {{AREA_NAME}}

Date: {{DATE}}

Respected Sir/Madam,

Under the RTI Act, 2005, I request the following information:

1. {{QUESTION_1}}
2. {{QUESTION_2}}
3. What is the total budget allocated for {{SERVICE_TYPE}} in {{AREA_NAME}} for the year {{FINANCIAL_YEAR}}?
4. Please provide details of the officer responsible for {{SERVICE_TYPE}} in this ward/area.

I am willing to pay the prescribed fee.

Thanking you,
{{APPLICANT_NAME}}
{{APPLICANT_ADDRESS}}
Phone: {{PHONE_NUMBER}}`,
    placeholders: [
      { key: "{{CITY_NAME}}", label: "City/Town Name", type: "text", required: true },
      { key: "{{DISTRICT_NAME}}", label: "District Name", type: "text", required: true },
      { key: "{{SERVICE_TYPE}}", label: "Service Type (e.g. Water Supply, Drainage)", type: "text", required: true },
      { key: "{{AREA_NAME}}", label: "Ward/Area Name", type: "text", required: true },
      { key: "{{QUESTION_1}}", label: "Question 1", type: "textarea", required: true },
      { key: "{{QUESTION_2}}", label: "Question 2", type: "textarea", required: false },
      { key: "{{FINANCIAL_YEAR}}", label: "Financial Year", type: "text", required: true },
      { key: "{{APPLICANT_NAME}}", label: "Your Full Name", type: "text", required: true },
      { key: "{{APPLICANT_ADDRESS}}", label: "Your Address", type: "textarea", required: true },
      { key: "{{PHONE_NUMBER}}", label: "Phone Number", type: "text", required: true },
    ],
    sampleQuestions: [
      "Why is there irregular water supply in my area?",
      "What is the status of my building permission application?",
      "How much property tax was collected in my ward?",
    ],
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding...");

    // Clear existing data
    await Department.deleteMany({});
    await RTITemplate.deleteMany({});
    console.log("Cleared existing departments and templates");

    // Insert departments
    const insertedDepts = await Department.insertMany(departments);
    console.log(`Seeded ${insertedDepts.length} departments`);

    // Insert templates
    const insertedTemplates = await RTITemplate.insertMany(templates);
    console.log(`Seeded ${insertedTemplates.length} RTI templates`);

    console.log("\nSeeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
