package edu.cit.tupas.custodian;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/custodians")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowCredentials = "true")
public class CustodianController {
    
    @Autowired
    private CustodianService custodianService;
    
    @GetMapping
    public List<CustodianEntity> getAllCustodians() {
        return custodianService.getAllCustodians();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CustodianEntity> getCustodianById(@PathVariable Long id) {
        Optional<CustodianEntity> custodian = custodianService.getCustodianById(id);
        return custodian.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/department/{department}")
    public List<CustodianEntity> getCustodiansByDepartment(@PathVariable String department) {
        return custodianService.getCustodiansByDepartment(department);
    }
    
    @PostMapping
    public CustodianEntity createCustodian(@RequestBody CustodianEntity custodian) {
        return custodianService.createCustodian(custodian);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CustodianEntity> updateCustodian(@PathVariable Long id, @RequestBody CustodianEntity custodianDetails) {
        try {
            CustodianEntity updatedCustodian = custodianService.updateCustodian(id, custodianDetails);
            return ResponseEntity.ok(updatedCustodian);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustodian(@PathVariable Long id) {
        try {
            custodianService.deleteCustodian(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}