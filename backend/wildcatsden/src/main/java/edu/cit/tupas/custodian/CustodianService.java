package edu.cit.tupas.custodian;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CustodianService {
    
    @Autowired
    private CustodianRepository custodianRepository;
    
    public List<CustodianEntity> getAllCustodians() {
        return custodianRepository.findAll();
    }
    
    public Optional<CustodianEntity> getCustodianById(Long id) {
        return custodianRepository.findById(id);
    }
    
    public CustodianEntity createCustodian(CustodianEntity custodian) {
        return custodianRepository.save(custodian);
    }
    
    public CustodianEntity updateCustodian(Long id, CustodianEntity custodianDetails) {
        CustodianEntity custodian = custodianRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Custodian not found with id: " + id));
        
        custodian.setFirstName(custodianDetails.getFirstName());
        custodian.setLastName(custodianDetails.getLastName());
        custodian.setDepartment(custodianDetails.getDepartment());
        custodian.setEmail(custodianDetails.getEmail());
        
        return custodianRepository.save(custodian);
    }
    
    public void deleteCustodian(Long id) {
        CustodianEntity custodian = custodianRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Custodian not found with id: " + id));
        custodianRepository.delete(custodian);
    }
    
    public List<CustodianEntity> getCustodiansByDepartment(String department) {
        return custodianRepository.findByDepartment(department);
    }
    
    public Optional<CustodianEntity> getCustodianByEmail(String email) {
        return custodianRepository.findByEmail(email).stream().findFirst();
    }
}