import { Request, Response } from "express";
import { UserService } from "./user.service";

const createPatient = async (req: Request, res: Response) => {
  try {
    console.log("controlller hit");
    const result = await UserService.createPatient(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSoloNurse = async (req: Request, res: Response) => {
  try {
    const {
      certificateType,
      certificateName,
      startTime,
      endTime,
      workingDays,
      Services,
      speciality,
      experience,
      MedicalLicense,
      qualifications,
      about,
      consultationFee,

      totalThisMonth,
      pending,
      availbleForWithdrawal,

      cardHolderName,
      cardNumber,
      cvv,
      expiryDate,

      ...data
    } = req.body;

    const certificateUrl = req.file ? (req.file as any).path : null;
    console.log("certificateUrl", certificateUrl);

    const certificates = {
      uploadCertificates: certificateUrl ? certificateUrl : null,
      certificateType,
      certificateName,
    };
    const availability = {
      startTime,
      endTime,
      workingDays,
    };

    const professionalInformation = {
      Services,
      speciality,
      experience,
      MedicalLicense,
      qualifications,
      about,
      consultationFee,
    };

    const withdrawalMethods = [
      {
        cardHolderName,
        cardNumber,
        cvv,
        expiryDate,
      },
    ];

    const paymentAndEarnings = {
      totalEarnings: {
        totalThisMonth: 0,
        pending: 0,
        availbleForWithdrawal: 0,
      },
      withdrawalMethods,
    };
    const result = await UserService.createSoloNurse({
      ...data,
      certificates,
      availability,
      professionalInformation,
      paymentAndEarnings,
    });
    res.status(201).json({
      success: true,
      message: "Solo Nurse created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const createClinic = async (req: Request, res: Response) => {
  try {
    const {
      certificateType,
      certificateName,
      startTime,
      endTime,
      appointmentType,
      Services,
      speciality,
      experience,
      MedicalLicense,
      qualifications,
      about,
      consultationFee,

      totalThisMonth,
      pending,
      availbleForWithdrawal,

      cardHolderName,
      cardNumber,
      cvv,
      expiryDate,
      servicesOffered,

      ...data
    } = req.body;

    // console.log("from controller ", req.body);

    const certificateUrl = req.file ? (req.file as any).path : null;
    console.log("certificateUrl", certificateUrl);

    const clinicCertificates = {
      uploadCertificates: certificateUrl ? certificateUrl : null,
      certificateType,
      certificateName,
    };

    const servicesOfferedData = servicesOffered?.split(",")
      .map((service: string) => service.trim());

    console.log(servicesOfferedData);

    const availability = {
      startTime,
      endTime,
      appointmentType,
    };

    const withdrawalMethods = [
      {
        cardHolderName,
        cardNumber,
        cvv,
        expiryDate,
      },
    ];

    const paymentAndEarnings = {
      totalEarnings: {
        totalThisMonth: 0,
        pending: 0,
        availbleForWithdrawal: 0,
      },
      withdrawalMethods,
    };
    const result = await UserService.createClinic({
      ...data,
      clinicCertificates,
      availability,
      servicesOffered: servicesOfferedData,
      paymentAndEarnings,
    });

    console.log("clinic create", result);
    res.status(201).json({
      success: true,
      message: "Solo Nurse created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const user_controllers = {
  createPatient,
  createSoloNurse,
  createClinic,
};
